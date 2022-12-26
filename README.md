# p5js
p5js repo for teaching by [Jon E. Froehlich](https://jonfroehlich.github.io/). Many of these programs are also available in the [p5js editor](https://editor.p5js.org/jonfroehlich/sketches) (in one form or another though typically the code on this page—which is served from [GitHub](https://github.com/makeabilitylab/p5js)—is more up-to-date)

# Some fun examples
You can see all of this code at our [p5js GitHub repo](https://github.com/makeabilitylab/p5js).

## Color

* [ColorExplorer3D](https://makeabilitylab.github.io/p5js/Color/ColorExplorer3D/): Explore the RGB color space in 2D and 3D. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Color/ColorExplorer3D)

## Sound

### Visualizing Sound Level

#### Simple Sound Level Meters

* [Sound Level 1: Circle Size Meter](https://makeabilitylab.github.io/p5js/Sound/SoundLevel1-CircleSizeMeter): Visualizes the amplitude of microphone input in realtime (sound loudness) as a circle. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/SoundLevel1-CircleSizeMeter)

* [Sound Level 2: Circle Y Location Meter](https://makeabilitylab.github.io/p5js/Sound/SoundLevel2-CircleYLocationMeter): Visualizes the amplitude of microphone input in realtime (sound loudness) by changing the y-location of a circle. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/SoundLevel2-CircleYLocationMeter)

#### Abstract Sound Visualizations

* [Sound Level Bubbles 1: Simple](https://makeabilitylab.github.io/p5js/Sound/SoundLevelBubbles1-Simple): Visualizes the amplitude of microphone input in realtime (sound loudness) as a set of random circles. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/SoundLevelBubbles1-Simple)

* [Sound Level Bubbles 2: Image](https://makeabilitylab.github.io/p5js/Sound/SoundLevelBubbles2-Image): Visualizes the amplitude of microphone input in realtime (sound loudness) as a set of random circles colored by a backing image. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/SoundLevelBubbles2-Image)

* [Sound Reactive Flower 1: Sound Level](https://makeabilitylab.github.io/p5js/Sound/SoundReactiveFlower1-SoundLevel): Visualizes the amplitude of microphone input in realtime (sound loudness) as a set of rotating flower petals. Each petal represents sound loudness at a snapshot in time. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/SoundReactiveFlower1-SoundLevel)

#### Time-series Visualizations

* [Sound Level Time Series 1: Simple](https://makeabilitylab.github.io/p5js/Sound/SoundLevelTimesSeries1-Simple): A very simple visualization of sound level over time. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/SoundLevelTimesSeries1-Simple)

* [Sound Level Time Series 2: Axes](https://makeabilitylab.github.io/p5js/Sound/SoundLevelTimesSeries2-Axes): Builds on the previous example but adds in axes. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/SoundLevelTimesSeries2-Axes)

#### Waveform Visualizations

* [Waveform Vis 1: Simple](https://makeabilitylab.github.io/p5js/Sound/WaveformVis1-Simple): Visualizes the waveform currently in the sound buffer. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/WaveformVis1-Simple)

### Visualizing Sound Frequency

You can learn more about analyzing sound frequency using Fast Fourier Transforms [here](https://makeabilitylab.github.io/physcomp/signals/frequency-analysis.html). But you don't need to understand the underlying mathematics to extract and visualize the underlying frequencies of sound waves in p5js, their [FFT library](https://p5js.org/reference/#/p5.FFT) and examples make it easy!

#### Frequency Bar Graphs

* [Frequency Bar Graph 1: Simple](https://makeabilitylab.github.io/p5js/Sound/FrequencyBarGraph1-Simple): Visualizes the average underlying frequency amplitudes of sound (as measured by microphone input) using logarithmically-sized bins. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/FrequencyBarGraph1-Simple)

* [Frequency Bar Graph 2: Axes](https://makeabilitylab.github.io/p5js/Sound/FrequencyBarGraph2-Axes): Builds on the previous example but adds in axes. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/FrequencyBarGraph2-Axes)

* [Frequency Bar Graph 3: With Classes](https://makeabilitylab.github.io/p5js/Sound/FrequencyBarGraph3-WithClasses): Builds on the previous example but uses a more object-oriented approach. Also visualizes and animates peaks. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/FrequencyBarGraph3-WithClasses)

#### Frequency Spectrum Line Graphs

* [Frequency Spectrum 1: Sound Level](https://makeabilitylab.github.io/p5js/Sound/FrequencySpectrum1-SoundLevel): Visualizes the current frequency spectrum in real-time [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/FrequencySpectrum1-SoundLevel)

#### Abstract Frequency Visualizations

* [Frequency Bubbles 1: Simple](https://makeabilitylab.github.io/p5js/Sound/FrequencyBubbles1-Simple): Visualizes each FFT frequency bin as a dynamically sized circle proportional to frequency amplitude in that bin. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/FrequencyBubbles1-Simple)

* [Frequency Bubbles 2: Image](https://makeabilitylab.github.io/p5js/Sound/FrequencyBubbles2-Image): Visualizes each FFT frequency bin as a dynamically sized circle proportional to frequency amplitude in that bin. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/FrequencyBubbles2-Image)

* [Sound Reactive Flower 2: Frequency](https://makeabilitylab.github.io/p5js/Sound/SoundReactiveFlower2-Frequency): Visualizes the frequency amplitudes of microphone input as dynamically sized flower petals. Each petal is assigned a certain frequency range. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/SoundReactiveFlower2-Frequency)

### Visualizing Multiple Sound Properties

* [Sound Visualization](https://makeabilitylab.github.io/p5js/Sound/SoundVis4-ImprovedPerformance/): Processes microphone input in realtime and shows a scrolling waveform and various frequency visualizations (spectrogram, spectral graph). Writes to an off-screen graphics buffer for performance. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Sound/SoundVis4-ImprovedPerformance).

## Perlin Noise

* [NoiseGraph](https://makeabilitylab.github.io/p5js/PerlinNoise/NoiseGraph): Compare random to [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise) in a scrolling graph. [Code link](https://github.com/makeabilitylab/p5js/tree/master/PerlinNoise/Noise2D).
* [Noise2D](https://makeabilitylab.github.io/p5js/PerlinNoise/Noise2D/): Explore [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise) in 2D. [Code link](https://github.com/makeabilitylab/p5js/tree/master/PerlinNoise/NoiseGraph).

## Vectors

* [Angle Explorer](https://makeabilitylab.github.io/p5js/Vectors/AngleExplorer/): Shows how to use vectors to calculate angles
* [Angle Playground](https://makeabilitylab.github.io/p5js/Vectors/AnglePlayground/): Draw two arrows and calculate angle between them
* [Bouncing balls and line segments](https://makeabilitylab.github.io/p5js/Vectors/BouncingBallsAndLineSegmentsImproved/): Demonstrates how to use vectors to calculate vectors and reflecting collisions

## Computer Vision

* [Hand pose demo](https://makeabilitylab.github.io/p5js/ml5js/HandPose/HandPoseDemo/): demonstration of the [ml5js](https://ml5js.org/) [handpose library](https://learn.ml5js.org/#/reference/handpose)
* [Hand wave recognizer](https://makeabilitylab.github.io/p5js/ml5js/HandPose/HandWaveDetector/): wave your hand at the camera
* [Elmo generator](https://makeabilitylab.github.io/p5js/ml5js/PoseNet/ElmoGeneratorMultiperson/): turn you and your friends into Elmo in realtime! Uses the [ml5js PoseNet implementation](https://learn.ml5js.org/#/reference/posenet)

## Games

Many of these games were created in 2020 when I first started learning p5js.

* [Snake](https://makeabilitylab.github.io/p5js/Games/Snake/): simple [Snake](https://en.wikipedia.org/wiki/Snake) game. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Games/Snake).
* [Pong](https://makeabilitylab.github.io/p5js/Games/Pong): simple [Pong](https://en.wikipedia.org/wiki/Pong) game. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Games/Pong).
* [Flappy Bird](https://makeabilitylab.github.io/p5js/Games/FlappyBird2/): simple [Flappy Bird](https://en.wikipedia.org/wiki/Flappy_Bird) game with procedural backgrounds. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Games/FlappyBird2).
* [Cookie Monster](https://makeabilitylab.github.io/p5js/Games/CookieMonster3/): simple 2D game starring my face and Sesame Street's cookie monster. This is my children's favorite game. Inspired by [Robotron](https://en.wikipedia.org/wiki/Robotron:_2084). [Code link](https://github.com/makeabilitylab/p5js/tree/master/Games/CookieMonster3)
* [Simple Keyboard Game](https://makeabilitylab.github.io/p5js/Games/SimpleKeyboardGame/): rapid prototype of a simple 2D game like [Cookie Monster](https://makeabilitylab.github.io/p5js/Games/CookieMonster3/). [Code link](https://github.com/makeabilitylab/p5js/tree/master/Games/SimpleKeyboardGame).

### Sound as input

* [FFTGame](https://makeabilitylab.github.io/p5js/Games/FFTGame/): use different frequencies (pitches) of sound to launch a ball into the air. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Games/FFTGame)

## Makeability Lab Logos

The Makeability Lab logo is precisely geometric in its foundation, composed solely of triangles and 45 degree angles. I've long wanted to programmatically play with this form. Here are some of my experiments:

* [Makeability Lab Logo](https://makeabilitylab.github.io/p5js/Art/MakeabilityLabLogo): a programmatically built logo. Use keyboard commands to turn certain features/layers off.

* [Makeability Lab - Animation1 - Grid Fade Appearance](https://makeabilitylab.github.io/p5js/Art/MakeabilityLabAnimation1-GridFade): a triangle-based grid appears and the ML logo emerges

* [Makeability Lab Logo - Animation2 - Reverse Explosion](https://makeabilitylab.github.io/p5js/Art/MakeabilityLabAnimation2-ReverseExplosion): the ML logos start in random places and animate towards their final composition

### Makeability Lab Holiday Cards

* [Holiday Card 2023](https://makeabilitylab.github.io/p5js/Art/SantaToMakeabilityLab/): The interactive Makeability Lab holiday card for 2023 morphs a triangular Santa into the Makeability Lab logo. [Code link](https://github.com/makeabilitylab/p5js/tree/master/Art/SantaToMakeabilityLab)
