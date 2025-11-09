#!/usr/bin/env python3
"""
Interactive Corner Coordinate Editor

This script provides a GUI for editing corner coordinates on track SVG maps.
You can drag corners to their correct positions and save them to tracks.json.

Usage:
    python scripts/edit_corner_coordinates.py

Features:
    - Loads all tracks from tracks.json
    - Track selector dropdown to switch between tracks
    - Renders SVG track maps directly on canvas
    - Displays all corners as draggable markers
    - Shows corner numbers and types
    - Saves coordinates to tracks.json
    - Supports zoom and pan
    - Edit all tracks in one session
"""

import json
import sys
import io
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, List, Tuple, Optional

try:
    import tkinter as tk
    from tkinter import ttk, messagebox
except ImportError:
    print("Error: tkinter is not available. Please install Python with tkinter support.")
    sys.exit(1)


class SVGPathRenderer:
    """Simple SVG path renderer for tkinter canvas"""
    
    @staticmethod
    def parse_path_data(path_data: str) -> List[Tuple[str, List[float]]]:
        """Parse SVG path data into commands and coordinates"""
        # Remove whitespace and split by commands
        commands = re.findall(r'[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*', path_data)
        parsed = []
        
        for cmd_str in commands:
            if not cmd_str:
                continue
            cmd = cmd_str[0]
            coords_str = cmd_str[1:].strip()
            
            if cmd.upper() == 'Z':
                parsed.append(('Z', []))
                continue
            
            # Parse coordinates
            coords = []
            if coords_str:
                # Handle negative numbers and decimals
                numbers = re.findall(r'-?\d+\.?\d*', coords_str)
                coords = [float(n) for n in numbers]
            
            parsed.append((cmd, coords))
        
        return parsed
    
    @staticmethod
    def draw_path_on_canvas(canvas, path_data: str, viewbox: Dict, scale: float, offset_x: float, offset_y: float, 
                            stroke_color: str = '#374151', stroke_width: float = 2.0):
        """Draw SVG path on tkinter canvas"""
        parsed = SVGPathRenderer.parse_path_data(path_data)
        
        if not parsed:
            return
        
        # Convert viewbox coordinates to canvas coordinates
        vb_width = viewbox['width']
        vb_height = viewbox['height']
        vb_min_x = viewbox['minX']
        vb_min_y = viewbox['minY']
        
        def vb_to_canvas(x: float, y: float) -> Tuple[float, float]:
            # Normalize to 0-1 range
            norm_x = (x - vb_min_x) / vb_width
            norm_y = (y - vb_min_y) / vb_height
            # Scale and offset
            canvas_x = offset_x + (norm_x * vb_width * scale)
            canvas_y = offset_y + (norm_y * vb_height * scale)
            return canvas_x, canvas_y
        
        # Track current position
        current_x, current_y = 0.0, 0.0
        start_x, start_y = 0.0, 0.0
        
        i = 0
        while i < len(parsed):
            cmd, coords = parsed[i]
            cmd_upper = cmd.upper()
            
            if cmd_upper == 'M':  # Move to (absolute)
                if len(coords) >= 2:
                    current_x, current_y = coords[0], coords[1]
                    start_x, start_y = current_x, current_y
                    # Handle multiple coordinates (implicit LineTo)
                    j = 2
                    while j < len(coords):
                        x, y = coords[j], coords[j+1]
                        cx, cy = vb_to_canvas(current_x, current_y)
                        nx, ny = vb_to_canvas(x, y)
                        canvas.create_line(cx, cy, nx, ny, fill=stroke_color, width=stroke_width)
                        current_x, current_y = x, y
                        j += 2
            elif cmd_upper == 'L':  # Line to (absolute)
                j = 0
                while j < len(coords):
                    x, y = coords[j], coords[j+1]
                    cx, cy = vb_to_canvas(current_x, current_y)
                    nx, ny = vb_to_canvas(x, y)
                    canvas.create_line(cx, cy, nx, ny, fill=stroke_color, width=stroke_width)
                    current_x, current_y = x, y
                    j += 2
            elif cmd_upper == 'C':  # Cubic Bezier (absolute)
                j = 0
                while j < len(coords):
                    if j + 5 < len(coords):
                        x1, y1 = coords[j], coords[j+1]
                        x2, y2 = coords[j+2], coords[j+3]
                        x, y = coords[j+4], coords[j+5]
                        # Approximate Bezier with multiple line segments
                        steps = 20
                        prev_x, prev_y = current_x, current_y
                        for step in range(1, steps + 1):
                            t = step / steps
                            # Cubic Bezier formula
                            bx = (1-t)**3 * prev_x + 3*(1-t)**2*t * x1 + 3*(1-t)*t**2 * x2 + t**3 * x
                            by = (1-t)**3 * prev_y + 3*(1-t)**2*t * y1 + 3*(1-t)*t**2 * y2 + t**3 * y
                            cx, cy = vb_to_canvas(prev_x, prev_y)
                            nx, ny = vb_to_canvas(bx, by)
                            canvas.create_line(cx, cy, nx, ny, fill=stroke_color, width=stroke_width)
                            prev_x, prev_y = bx, by
                        current_x, current_y = x, y
                    j += 6
            elif cmd_upper == 'Z':  # Close path
                cx, cy = vb_to_canvas(current_x, current_y)
                sx, sy = vb_to_canvas(start_x, start_y)
                canvas.create_line(cx, cy, sx, sy, fill=stroke_color, width=stroke_width)
                current_x, current_y = start_x, start_y
            
            i += 1


class CornerEditor:
    def __init__(self, root):
        self.root = root
        self.tracks_file = Path('public/data/tracks.json')
        self.svg_dir = Path('public/Tracks')
        
        # Load all tracks data
        self.all_tracks_data = {}
        self.load_all_tracks()
        
        # Current track
        self.current_track_id = None
        self.track_data = None
        self.svg_path = None
        self.viewbox = {'minX': 0, 'minY': 0, 'width': 600, 'height': 700}
        self.corners: List[Dict] = []
        
        # GUI state
        self.scale = 1.0
        self.pan_x = 0
        self.pan_y = 0
        self.selected_corner = None
        self.selected_corner_idx = None
        self.drag_start = None
        self.canvas_width = 1000
        self.canvas_height = 700
        
        # SVG paths cache
        self.svg_paths = []
        
        # Setup GUI
        self.setup_gui()
        
        # Load first track if available
        if self.track_ids:
            self.current_track_id = self.track_ids[0]
            self.load_track(self.current_track_id)
    
    def load_all_tracks(self):
        """Load all tracks from tracks.json"""
        if not self.tracks_file.exists():
            raise FileNotFoundError(f"Track file not found: {self.tracks_file}")
        
        with open(self.tracks_file, 'r') as f:
            data = json.load(f)
        
        self.all_tracks_data = data.get('tracks', {})
        self.track_ids = sorted(self.all_tracks_data.keys())
    
    def load_track(self, track_id: str):
        """Load a specific track"""
        if track_id not in self.all_tracks_data:
            messagebox.showerror("Error", f"Track '{track_id}' not found")
            return
        
        self.current_track_id = track_id
        self.track_data = self.all_tracks_data[track_id]
        
        # Get SVG file
        svg_file = self.track_data.get('svgFile')
        if not svg_file:
            messagebox.showerror("Error", f"Track '{track_id}' has no svgFile specified")
            return
        
        self.svg_path = self.svg_dir / svg_file
        if not self.svg_path.exists():
            messagebox.showerror("Error", f"SVG file not found: {self.svg_path}")
            return
        
        # Parse SVG viewbox and paths
        self.viewbox = self.parse_svg_viewbox()
        self.svg_paths = self.parse_svg_paths()
        
        # Load corners
        self.corners = self.track_data.get('corners', []).copy()
        
        # Ensure all corners have x, y coordinates
        for corner in self.corners:
            if 'x' not in corner:
                corner['x'] = self.viewbox['width'] / 2
            if 'y' not in corner:
                corner['y'] = self.viewbox['height'] / 2
        
        # Update GUI
        self.update_track_info()
        self.scale_to_fit()
        self.update_canvas()
        self.update_corner_list()
    
    def parse_svg_viewbox(self) -> Dict[str, float]:
        """Parse viewBox from SVG file"""
        try:
            tree = ET.parse(self.svg_path)
            root = tree.getroot()
            
            # Get viewBox attribute
            viewbox_attr = root.get('viewBox') or root.get('{http://www.w3.org/2000/svg}viewBox')
            
            if viewbox_attr:
                parts = viewbox_attr.split()
                if len(parts) == 4:
                    return {
                        'minX': float(parts[0]),
                        'minY': float(parts[1]),
                        'width': float(parts[2]),
                        'height': float(parts[3])
                    }
        except Exception as e:
            print(f"Warning: Could not parse viewBox: {e}")
        
        # Default viewBox
        return {'minX': 0, 'minY': 0, 'width': 600, 'height': 700}
    
    def parse_svg_paths(self) -> List[Dict]:
        """Parse all path elements from SVG"""
        paths = []
        try:
            tree = ET.parse(self.svg_path)
            root = tree.getroot()
            
            # Find all path elements
            for path in root.findall('.//{http://www.w3.org/2000/svg}path') + root.findall('.//path'):
                path_data = path.get('d', '')
                stroke = path.get('stroke', '#374151')
                stroke_width = float(path.get('stroke-width', '2'))
                
                if path_data:
                    paths.append({
                        'data': path_data,
                        'stroke': stroke,
                        'stroke_width': stroke_width
                    })
        except Exception as e:
            print(f"Warning: Could not parse SVG paths: {e}")
        
        return paths
    
    def scale_to_fit(self):
        """Scale view to fit track"""
        vb_width = self.viewbox['width']
        vb_height = self.viewbox['height']
        
        # Calculate scale to fit canvas
        scale_x = (self.canvas_width - 40) / vb_width
        scale_y = (self.canvas_height - 40) / vb_height
        self.scale = min(scale_x, scale_y) * 0.9  # 90% to leave margin
        
        # Center track
        scaled_width = vb_width * self.scale
        scaled_height = vb_height * self.scale
        self.pan_x = (self.canvas_width - scaled_width) / 2
        self.pan_y = (self.canvas_height - scaled_height) / 2
    
    def setup_gui(self):
        """Setup the GUI"""
        self.root.title("Corner Coordinate Editor - All Tracks")
        self.root.geometry(f"{self.canvas_width + 350}x{self.canvas_height + 150}")
        
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Top frame with track selector
        top_frame = ttk.Frame(main_frame)
        top_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        ttk.Label(top_frame, text="Track:", font=('Arial', 12, 'bold')).pack(side=tk.LEFT, padx=5)
        self.track_var = tk.StringVar()
        self.track_combobox = ttk.Combobox(top_frame, textvariable=self.track_var, 
                                           values=self.track_ids, state='readonly', width=30)
        self.track_combobox.pack(side=tk.LEFT, padx=5)
        self.track_combobox.bind('<<ComboboxSelected>>', self.on_track_change)
        
        ttk.Button(top_frame, text="Load Track", command=self.on_load_track).pack(side=tk.LEFT, padx=5)
        ttk.Button(top_frame, text="Save Changes", command=self.save_changes).pack(side=tk.LEFT, padx=5)
        
        # Canvas for track and corners
        canvas_frame = ttk.Frame(main_frame)
        canvas_frame.grid(row=1, column=0, padx=5, pady=5, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        self.canvas = tk.Canvas(canvas_frame, width=self.canvas_width, height=self.canvas_height, 
                               bg='white', cursor='crosshair')
        self.canvas.pack(fill=tk.BOTH, expand=True)
        
        # Bind events
        self.canvas.bind('<Button-1>', self.on_canvas_click)
        self.canvas.bind('<B1-Motion>', self.on_canvas_drag)
        self.canvas.bind('<ButtonRelease-1>', self.on_canvas_release)
        self.canvas.bind('<MouseWheel>', self.on_mousewheel)
        self.canvas.bind('<Button-4>', self.on_mousewheel)
        self.canvas.bind('<Button-5>', self.on_mousewheel)
        self.canvas.focus_set()
        
        # Control panel
        control_frame = ttk.LabelFrame(main_frame, text="Controls", padding="10")
        control_frame.grid(row=1, column=1, sticky=(tk.W, tk.E, tk.N), padx=5, pady=5)
        
        # Track info
        self.info_label = ttk.Label(control_frame, text="Select a track", font=('Arial', 10, 'bold'))
        self.info_label.grid(row=0, column=0, pady=5, sticky=tk.W)
        
        self.corners_label = ttk.Label(control_frame, text="")
        self.corners_label.grid(row=1, column=0, pady=5, sticky=tk.W)
        
        # Buttons
        ttk.Button(control_frame, text="Reset View", command=self.reset_view).grid(row=2, column=0, pady=5, sticky=(tk.W, tk.E))
        ttk.Button(control_frame, text="Zoom In", command=lambda: self.zoom(1.2)).grid(row=3, column=0, pady=5, sticky=(tk.W, tk.E))
        ttk.Button(control_frame, text="Zoom Out", command=lambda: self.zoom(0.8)).grid(row=4, column=0, pady=5, sticky=(tk.W, tk.E))
        ttk.Button(control_frame, text="Delete Selected Corner", command=self.delete_selected_corner, 
                   style='Danger.TButton').grid(row=5, column=0, pady=5, sticky=(tk.W, tk.E))
        
        # Configure danger button style
        style = ttk.Style()
        style.configure('Danger.TButton', foreground='red')
        
        # Corner list
        list_frame = ttk.LabelFrame(main_frame, text="Corners", padding="10")
        list_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), padx=5, pady=5)
        
        # Scrollable list
        list_container = ttk.Frame(list_frame)
        list_container.pack(fill=tk.BOTH, expand=True)
        
        scrollbar = ttk.Scrollbar(list_container)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.corner_listbox = tk.Listbox(list_container, yscrollcommand=scrollbar.set, height=8)
        self.corner_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.corner_listbox.yview)
        
        self.corner_listbox.bind('<<ListboxSelect>>', self.on_corner_select)
        
        # Status bar
        self.status_label = ttk.Label(main_frame, text="Ready - Select a track to begin")
        self.status_label.grid(row=3, column=0, columnspan=2, pady=5)
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
    
    def update_track_info(self):
        """Update track info display"""
        if self.track_data:
            self.info_label.config(text=f"Track: {self.track_data.get('name', self.current_track_id)}")
            self.corners_label.config(text=f"Corners: {len(self.corners)}")
            self.track_var.set(self.current_track_id)
    
    def update_canvas(self):
        """Update canvas with track and corners"""
        self.canvas.delete('all')
        
        if not self.current_track_id:
            return
        
        # Draw SVG paths
        for path_info in self.svg_paths:
            SVGPathRenderer.draw_path_on_canvas(
                self.canvas,
                path_info['data'],
                self.viewbox,
                self.scale,
                self.pan_x,
                self.pan_y,
                path_info['stroke'],
                path_info['stroke_width'] * self.scale / 10.0  # Scale stroke width
            )
        
        # Draw corners
        self.draw_corners()
    
    def draw_corners(self):
        """Draw corner markers on canvas"""
        for corner in self.corners:
            x, y = self.svg_to_canvas(corner['x'], corner['y'])
            
            # Corner marker (circle)
            color = self.get_corner_color(corner.get('type', 'unknown'))
            radius = 10
            
            # Draw circle
            self.canvas.create_oval(x - radius, y - radius, x + radius, y + radius,
                                  fill=color, outline='black', width=2, tags=f"corner_{corner['number']}")
            
            # Draw corner number
            self.canvas.create_text(x, y - radius - 12, text=str(corner['number']),
                                  fill='black', font=('Arial', 12, 'bold'),
                                  tags=f"corner_{corner['number']}")
            
            # Store corner data in canvas item
            self.canvas.itemconfig(f"corner_{corner['number']}", tags=(f"corner_{corner['number']}", 'corner'))
    
    def get_corner_color(self, corner_type: str) -> str:
        """Get color for corner type"""
        colors = {
            'slow': '#FF4444',      # Red
            'medium': '#FFAA00',    # Orange
            'fast': '#44FF44',      # Green
        }
        return colors.get(corner_type.lower(), '#888888')  # Gray for unknown
    
    def svg_to_canvas(self, svg_x: float, svg_y: float) -> Tuple[float, float]:
        """Convert SVG coordinates to canvas coordinates"""
        # Account for viewbox
        rel_x = (svg_x - self.viewbox['minX']) / self.viewbox['width']
        rel_y = (svg_y - self.viewbox['minY']) / self.viewbox['height']
        
        # Account for scaling and panning
        canvas_x = self.pan_x + (rel_x * self.viewbox['width'] * self.scale)
        canvas_y = self.pan_y + (rel_y * self.viewbox['height'] * self.scale)
        
        return canvas_x, canvas_y
    
    def canvas_to_svg(self, canvas_x: float, canvas_y: float) -> Tuple[float, float]:
        """Convert canvas coordinates to SVG coordinates"""
        # Account for panning
        rel_x = (canvas_x - self.pan_x) / self.scale
        rel_y = (canvas_y - self.pan_y) / self.scale
        
        # Convert to absolute SVG coordinates
        svg_x = self.viewbox['minX'] + rel_x
        svg_y = self.viewbox['minY'] + rel_y
        
        return svg_x, svg_y
    
    def on_track_change(self, event=None):
        """Handle track selection change"""
        track_id = self.track_var.get()
        if track_id and track_id != self.current_track_id:
            self.load_track(track_id)
    
    def on_load_track(self):
        """Handle load track button"""
        track_id = self.track_var.get()
        if track_id:
            self.load_track(track_id)
    
    def on_canvas_click(self, event):
        """Handle canvas click"""
        # Find clicked corner
        items = self.canvas.find_closest(event.x, event.y)
        if items:
            item = items[0]
            tags = self.canvas.gettags(item)
            
            # Check if it's a corner
            for tag in tags:
                if tag.startswith('corner_') and tag != 'corner':
                    corner_num = int(tag.split('_')[1])
                    self.selected_corner = next((c for c in self.corners if c['number'] == corner_num), None)
                    if self.selected_corner:
                        self.drag_start = (event.x, event.y)
                        self.status_label.config(text=f"Dragging Corner {corner_num}")
                        break
    
    def on_canvas_drag(self, event):
        """Handle canvas drag"""
        if self.selected_corner and self.drag_start:
            # Calculate new position
            svg_x, svg_y = self.canvas_to_svg(event.x, event.y)
            
            # Update corner position
            self.selected_corner['x'] = svg_x
            self.selected_corner['y'] = svg_y
            
            # Update display
            self.update_canvas()
            
            # Update status
            self.status_label.config(text=f"Corner {self.selected_corner['number']}: ({svg_x:.1f}, {svg_y:.1f})")
    
    def on_canvas_release(self, event):
        """Handle canvas release"""
        if self.selected_corner:
            # Update corner list
            self.update_corner_list()
        
        self.selected_corner = None
        self.drag_start = None
        if self.current_track_id:
            self.status_label.config(text=f"Ready - {self.track_data.get('name', self.current_track_id)}")
    
    def update_corner_list(self):
        """Update corner list display"""
        self.corner_listbox.delete(0, tk.END)
        for corner in self.corners:
            corner_text = f"Corner {corner['number']} ({corner.get('type', 'unknown')}) - ({corner['x']:.1f}, {corner['y']:.1f})"
            self.corner_listbox.insert(tk.END, corner_text)
    
    def on_corner_select(self, event):
        """Handle corner list selection"""
        selection = self.corner_listbox.curselection()
        if selection:
            idx = selection[0]
            corner = self.corners[idx]
            self.selected_corner_idx = idx
            self.status_label.config(text=f"Selected: Corner {corner['number']} at ({corner['x']:.1f}, {corner['y']:.1f})")
        else:
            self.selected_corner_idx = None
    
    def on_mousewheel(self, event):
        """Handle mouse wheel zoom"""
        try:
            mouse_x = event.x
            mouse_y = event.y
        except AttributeError:
            mouse_x = self.canvas_width / 2
            mouse_y = self.canvas_height / 2
        
        if event.num == 4 or (hasattr(event, 'delta') and event.delta > 0):
            self.zoom(1.1, mouse_x, mouse_y)
        elif event.num == 5 or (hasattr(event, 'delta') and event.delta < 0):
            self.zoom(0.9, mouse_x, mouse_y)
    
    def zoom(self, factor: float, center_x: Optional[float] = None, center_y: Optional[float] = None):
        """Zoom in/out"""
        if center_x is None:
            center_x = self.canvas_width / 2
        if center_y is None:
            center_y = self.canvas_height / 2
        
        old_scale = self.scale
        self.scale *= factor
        self.scale = max(0.1, min(10.0, self.scale))
        
        # Adjust pan to zoom towards mouse position
        img_x = (center_x - self.pan_x) / old_scale
        img_y = (center_y - self.pan_y) / old_scale
        self.pan_x = center_x - (img_x * self.scale)
        self.pan_y = center_y - (img_y * self.scale)
        
        self.update_canvas()
    
    def reset_view(self):
        """Reset view to fit"""
        self.scale_to_fit()
        self.update_canvas()
        self.status_label.config(text="View reset")
    
    def delete_selected_corner(self):
        """Delete the selected corner"""
        if self.selected_corner_idx is None:
            messagebox.showwarning("Warning", "Please select a corner from the list to delete")
            return
        
        corner = self.corners[self.selected_corner_idx]
        corner_num = corner['number']
        
        # Confirm deletion
        result = messagebox.askyesno(
            "Confirm Delete",
            f"Are you sure you want to delete Corner {corner_num}?\n\nThis cannot be undone until you reload the track.",
            icon='warning'
        )
        
        if result:
            # Delete the corner
            del self.corners[self.selected_corner_idx]
            self.selected_corner_idx = None
            
            # Renumber corners sequentially
            for i, corner in enumerate(self.corners, start=1):
                corner['number'] = i
            
            # Update display
            self.update_canvas()
            self.update_corner_list()
            self.update_track_info()  # Update corner count
            self.status_label.config(text=f"Corner {corner_num} deleted. Corners renumbered. Click 'Save Changes' to save.")
    
    def save_changes(self):
        """Save corner coordinates to tracks.json"""
        if not self.current_track_id:
            messagebox.showwarning("Warning", "No track selected")
            return
        
        try:
            # Load current tracks.json
            with open(self.tracks_file, 'r') as f:
                data = json.load(f)
            
            # Update corners for current track
            data['tracks'][self.current_track_id]['corners'] = self.corners
            
            # Remove any _estimated flags
            for corner in data['tracks'][self.current_track_id]['corners']:
                corner.pop('_estimated', None)
            
            # Save back to file
            with open(self.tracks_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            # Update our local copy
            self.all_tracks_data[self.current_track_id]['corners'] = self.corners
            
            messagebox.showinfo("Success", f"Corner coordinates saved for {self.track_data.get('name', self.current_track_id)}!")
            self.status_label.config(text="Changes saved successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save changes: {e}")
            self.status_label.config(text=f"Error saving: {e}")


def main():
    # Create and run GUI
    root = tk.Tk()
    try:
        app = CornerEditor(root)
        root.mainloop()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
