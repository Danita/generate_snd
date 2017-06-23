# generate_snd

Scans the provided `.obj` file for `ATTR_manip_*` manipulator commands and generate a series of sound attachments which can be piped into a new file.

## Requirements

* [NodeJS](https://nodejs.org/es/) > 6.x
* [npm](https://nodejs.org/es/) or [Yarn](https://yarnpkg.com/en/)

## Installation

1. Clone the repo and run `npm install` or `yarn install`.
2. Create an `events.json` file with your events using this format:

```json
{
  "BUTTON": "/model/mymodel/switches/button",
  "ROTARY_SMALL": "/model/mymodel/switches/rotary1",
  "ROTARY_MEDIUM": "/model/mymodel/switches/rotary2",
  "ROTARY_LARGE": "/model/mymodel/switches/rotary3",
  "SWITCH": "/model/mymodel/switches/switch"
}
```

Obviously replacing the events names with your own. An example `events.json.example` file is included that you can use as a starting point. Rename it as `events.json` and edit at will.

## Usage

```
./generate_snd.js [options] <path/to/input.obj> > <path/to/output.snd>
```

* `input.obj` aircraft cockpit file.
* `output.snd` .snd compatible format which you can include into your own definition.
* `options`:
	* `-i, --ignorelines`: Pass a comma-separated list of line numbers to ignore from the cockpit file. 

Alternatively, you can install the tool globally, with `npm install -g` on the project directory. Then you could open the shell on any directory and directly execute:

```
generate_snd path/to/input.obj > path/to/output.snd
```

## Notes

Currently, manipulator support is as follows:

* `ATTR_manip_command`: **YES**
* `ATTR_manip_command_axis`: NO
* `ATTR_manip_push`: **YES**
* `ATTR_manip_toggle`: **YES**
* `ATTR_manip_delta`: **YES**
* `ATTR_manip_wrap`: **YES**
* `ATTR_manip_wheel`: NO (*)
* `ATTR_manip_command_knob`: NO
* `ATTR_manip_switch_up_down`: NO
* `ATTR_manip_switch_left_right`: NO
* `ATTR_manip_axis_knob`: NO
* `ATTR_manip_axis_switch_up_down`: NO
* `ATTR_manip_axis_switch_left_right`: NO

(*) Requires knowledge of the previous command

As you can see, I implemented just the manipulators I needed for the project I had at hand, but feel free to collaborate with more implementations and submit your pull request.
