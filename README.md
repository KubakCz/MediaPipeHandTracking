# Hand Capture

## Project Overview
This React application serves as a recorder for capturing hand movements using an RGB web camera. It utilizes Google's MediaPipe library to transform the captured data into 3D coordinates of hand joints, which are then exported together with the original video recording. While the primary aim is to support motion capture for violin playing, the recording functionality can be utilized for any type of hand recording.

This React application is part of my Master's thesis project, which focuses on combining data from traditional motion capture systems with hand tracking data generated from RGB video.

## Planned Features

- ☑ **Selecting Source Camera:** Users will have the option to select the desired camera source for recording hand movements.

- **Changing Camera Settings:** Users can adjust camera settings such as resolution, frame rate (FPS), focus, and brightness if supported by the camera.
  - *Resolution:* Adjust the resolution of the camera feed to meet specific requirements.
  - *FPS:* Control the frame rate of the camera feed for smooth recording.
  - *Focus and Brightness:* If supported by the camera, users can modify focus and brightness settings for optimal recording conditions.

- ☑ **Live Preview of Camera Stream:** The application will provide a live preview of the camera stream overlaid with hand tracking data visualization. This allows users to see real-time hand movements during recording.

- ☑ **Manual Recording Start and Stop:** Users can manually start and stop the recording process as needed.

- **Automatic Recording Synced with OptiTrack System:** Integration with OptiTrack system for automatic recording initiation and synchronization with other mocap data.

- **Output Video Recording:** The application will export recorded videos with options to include or exclude hand tracking data visualization. Additionally, 3D worldspace data of individual hand joints will be included in the output for further analysis.

- **Support for Multiple Cameras:** If feasible, the application will support the use of multiple cameras simultaneously for recording hand movements from different angles or perspectives.
