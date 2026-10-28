# CameraControls

Bottom controls of the live camera: three scan-mode tiles (Scan Food, Barcode, Food Label) and the shutter row (flash, shutter, library).

- **Consumer provides:** `value` + `onChange` (or `defaultValue`: `food` | `barcode` | `label`), `onCapture`.
- Only on the dark camera surface. Selected mode = white tile with ink text; others `camera-tile`.
