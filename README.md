# generate_snd

Scans the provided `.obj` file for `ATTR_manip_*` manipulator commands and generate a series of sound attachments which can be piped into a new file.

## Requirements

* [NodeJS](https://nodejs.org/es/) > 6.x
* [npm](https://nodejs.org/es/) or [Yarn](https://yarnpkg.com/en/)

Just clone the repo and run `npm install` or `yarn install`.

## Usage

```
./generate_snd.js path/to/input.obj > path/to/output.snd
```

* `input.obj` aircraft cockpit file.
* `output.snd` .snd compatible format which you can include into your own definition. 

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
