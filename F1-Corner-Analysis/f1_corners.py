import argparse
import numpy as np
import pandas as pd
import numpy as np
import pandas as pd
from pandas.api.types import (
    is_numeric_dtype,
    is_datetime64_any_dtype,
    is_timedelta64_dtype,
)
import fastf1
from fastf1.core import Laps
import matplotlib.pyplot as plt

# ---------- Utilities ----------
def enable_cache(path="cache"):
    fastf1.Cache.enable_cache(path)

def get_fastest_lap(session, driver_code):
    # pick_driver is deprecated, use pick_drivers
    laps = session.laps.pick_drivers(driver_code)
    return laps.pick_fastest()

def with_distance(car_data):
    if "Distance" not in car_data.columns:
        car_data = car_data.add_distance()
    return car_data

def resample_to_common_distance(tel_df, step=2.0):
    # clean and sort
    tel_df = tel_df.dropna(subset=["Distance"]).sort_values("Distance")
    tel_df = tel_df[~tel_df["Distance"].duplicated(keep="first")]

    max_d = float(tel_df["Distance"].max())
    grid = np.arange(0.0, max_d, step)
    out = pd.DataFrame({"Distance": grid})

    # interpolate numeric columns only, skipping datetime/timedelta
    for col in tel_df.columns:
        if col == "Distance" or col == "Time":
            continue
        if is_datetime64_any_dtype(tel_df[col]) or is_timedelta64_dtype(tel_df[col]):
            continue
        if not is_numeric_dtype(tel_df[col]):
            continue
        vals = tel_df[col].to_numpy(dtype=float, copy=False)
        out[col] = np.interp(grid, tel_df["Distance"].to_numpy(), vals)

    # handle Time separately as seconds
    if "Time" in tel_df.columns:
        # ensure timedelta64[ns]
        t = pd.to_timedelta(tel_df["Time"])
        t_sec = t.dt.total_seconds().to_numpy()
        out["Time_s"] = np.interp(grid, tel_df["Distance"].to_numpy(), t_sec)

    return out

def detect_corners(speed_series, distance_series, min_drop_kmh=18.0, min_recovery_kmh=10.0, min_len_pts=4):
    """
    Very simple heuristic:
    - A corner begins when speed starts a sustained drop larger than min_drop_kmh
    - The apex is the local minimum after the drop
    - Corner ends when speed recovers by min_recovery_kmh or trend reverses
    Returns a list of dicts with start_idx, apex_idx, end_idx.
    """
    sp = np.asarray(speed_series)
    d = np.asarray(distance_series)
    n = len(sp)
    corners = []
    i = 1
    while i < n - 2:
        # look for start of braking - negative gradient region
        if sp[i-1] - sp[i] < 0.5:
            i += 1
            continue
        # potential braking window
        j = i
        drop = 0.0
        while j < n - 1 and sp[j] - sp[j+1] > 0:  # descending
            drop += sp[j] - sp[j+1]
            j += 1
        if drop >= min_drop_kmh:
            # j is at the apex index approx
            apex_idx = j
            # now find recovery
            k = apex_idx
            recover = 0.0
            while k < n - 1 and recover < min_recovery_kmh and sp[k+1] - sp[k] >= -0.2:
                recover += max(0.0, sp[k+1] - sp[k])
                k += 1
            start_idx = max(i - 1, 0)
            end_idx = min(k + 1, n - 1)
            if end_idx - start_idx >= min_len_pts:
                corners.append({"start_idx": start_idx, "apex_idx": apex_idx, "end_idx": end_idx})
            i = end_idx + 1
        else:
            i = j + 1
    return corners

def per_corner_metrics(tel, corners):
    rows = []
    for idx, c in enumerate(corners, start=1):
        s, a, e = c["start_idx"], c["apex_idx"], c["end_idx"]
        entry_speed = float(tel["Speed"].iloc[s])
        apex_speed = float(tel["Speed"].iloc[a])
        exit_speed = float(tel["Speed"].iloc[e])
        t_start = float(tel["Time_s"].iloc[s])
        t_end = float(tel["Time_s"].iloc[e])
        dt = t_end - t_start
        rows.append({
            "Corner": idx,
            "d_start": float(tel["Distance"].iloc[s]),
            "d_apex": float(tel["Distance"].iloc[a]),
            "d_end": float(tel["Distance"].iloc[e]),
            "EntrySpeed": entry_speed,
            "ApexSpeed": apex_speed,
            "ExitSpeed": exit_speed,
            "CornerTime": dt
        })
    return pd.DataFrame(rows)

def align_corners_by_distance(corners_A, tel_A, corners_B, tel_B, tol_m=25.0):
    """
    Match corners A to B by apex distance proximity within tol_m meters.
    Returns list of tuples (cornerA, cornerB) as indices.
    """
    matches = []
    A_apex = [(i, tel_A["Distance"].iloc[c["apex_idx"]]) for i, c in enumerate(corners_A)]
    B_apex = [(j, tel_B["Distance"].iloc[c["apex_idx"]]) for j, c in enumerate(corners_B)]
    used_B = set()
    for i, dA in A_apex:
        best = None
        best_diff = 1e9
        for j, dB in B_apex:
            if j in used_B:
                continue
            diff = abs(dA - dB)
            if diff < best_diff and diff <= tol_m:
                best = j
                best_diff = diff
        if best is not None:
            used_B.add(best)
            matches.append((i, best))
    return matches

def plot_speed_with_corners(tel_A, tel_B, corners_A, corners_B, drvA, drvB, title):
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(tel_A["Distance"], tel_A["Speed"], label=f"{drvA} Speed")
    ax.plot(tel_B["Distance"], tel_B["Speed"], label=f"{drvB} Speed", alpha=0.9)

    # Shade A corners
    for c in corners_A:
        s = tel_A["Distance"].iloc[c["start_idx"]]
        e = tel_A["Distance"].iloc[c["end_idx"]]
        ax.axvspan(s, e, alpha=0.15)

    ax.set_xlabel("Distance [m]")
    ax.set_ylabel("Speed [km/h]")
    ax.set_title(title)
    ax.grid(True, alpha=0.3)
    ax.legend()
    plt.tight_layout()
    return fig

def plot_corner_deltas(dfA, dfB, matches, drvA, drvB):
    # Build time delta per matched corner: positive means A slower than B in that corner
    rows = []
    for ia, ib in matches:
        cnum = dfA.loc[ia, "Corner"]
        dt = dfA.loc[ia, "CornerTime"] - dfB.loc[ib, "CornerTime"]
        rows.append((cnum, dt))
    if not rows:
        return None
    rows.sort(key=lambda x: x[0])
    C = [r[0] for r in rows]
    DT = [r[1] for r in rows]
    fig, ax = plt.subplots(figsize=(12, 4))
    ax.bar(C, DT)
    ax.set_xlabel("Corner index")
    ax.set_ylabel(f"Time delta {drvA}-{drvB} [s]")
    ax.axhline(0.0, linewidth=1)
    ax.set_title("Per-corner time delta - positive means first driver is slower")
    ax.grid(True, axis="y", alpha=0.3)
    plt.tight_layout()
    return fig

# ---------- Main ----------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--year", type=int, default=2024)
    parser.add_argument("--gp", type=str, default="Monaco")   # examples: Monaco, Silverstone, Monza
    parser.add_argument("--session", type=str, default="Q")   # Q, R, FP1, FP2, FP3, SQ
    parser.add_argument("--drvA", type=str, default="VER")
    parser.add_argument("--drvB", type=str, default="NOR")
    parser.add_argument("--dist_step", type=float, default=2.0)
    parser.add_argument("--tol_m", type=float, default=25.0)
    args = parser.parse_args()

    enable_cache("cache")

    session = fastf1.get_session(args.year, args.gp, args.session)
    session.load()

    lapA = get_fastest_lap(session, args.drvA)
    lapB = get_fastest_lap(session, args.drvB)

    telA = with_distance(lapA.get_car_data())
    telB = with_distance(lapB.get_car_data())

    # resample to uniform distance grids
    telA_u = resample_to_common_distance(telA, step=args.dist_step)
    telB_u = resample_to_common_distance(telB, step=args.dist_step)

    # corner detection
    corners_A = detect_corners(telA_u["Speed"], telA_u["Distance"])
    corners_B = detect_corners(telB_u["Speed"], telB_u["Distance"])

    # metrics
    dfA = per_corner_metrics(telA_u, corners_A)
    dfB = per_corner_metrics(telB_u, corners_B)

    # match corners by apex distance
    matches = align_corners_by_distance(corners_A, telA_u, corners_B, telB_u, tol_m=args.tol_m)

    # plots
    title = f"{args.year} {args.gp} {args.session} - {args.drvA} vs {args.drvB}"
    fig1 = plot_speed_with_corners(telA_u, telB_u, corners_A, corners_B, args.drvA, args.drvB, title)
    fig2 = plot_corner_deltas(dfA, dfB, matches, args.drvA, args.drvB)

    # show plots
    plt.show()

    # print a small summary table
    if matches:
        out = []
        for ia, ib in matches:
            out.append({
                "Corner": int(dfA.loc[ia, "Corner"]),
                f"{args.drvA}_CornerTime_s": round(float(dfA.loc[ia, "CornerTime"]), 3),
                f"{args.drvB}_CornerTime_s": round(float(dfB.loc[ib, "CornerTime"]), 3),
                "Delta_s": round(float(dfA.loc[ia, "CornerTime"] - dfB.loc[ib, "CornerTime"]), 3),
                f"{args.drvA}_Apex_kmh": round(float(dfA.loc[ia, "ApexSpeed"]), 1),
                f"{args.drvB}_Apex_kmh": round(float(dfB.loc[ib, "ApexSpeed"]), 1)
            })
        out_df = pd.DataFrame(out).sort_values("Corner")
        print("\nMatched corner summary:")
        print(out_df.to_string(index=False))
    else:
        print("No matched corners within tolerance. Try increasing --tol_m.")

if __name__ == "__main__":
    main()