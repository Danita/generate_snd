#!/usr/bin/env node

/**
 * Build sound attachments according to ATTR_manip_* commands
 * @author Daniela Rodriguez Careri <dcareri@gmail.com>
 * @todo param to ignore datarefs
 * @todo param to ignore lines
 *
 */

const
	fs = require('fs'),
	path = require('path'),
	util = require('util'),
	Commander = require('commander')
;

/**
 * Generic event names
 * Configure according to the FMOD events you want to use
 * @type {object}
 */
const events = require('./events.json');

/**
 * Which cursor types should trigger which events
 * @type {object}
 */
const eventsByCursorType = {
	'four_arrows': events.BUTTON,
	'hand': events.BUTTON,
	'button': events.BUTTON,
	'rotate_small': events.ROTARY_SMALL,
	'rotate_small_left': events.ROTARY_SMALL,
	'rotate_small_right': events.ROTARY_SMALL,
	'rotate_medium': events.ROTARY_MEDIUM,
	'rotate_medium_left': events.ROTARY_MEDIUM,
	'rotate_medium_right': events.ROTARY_MEDIUM,
	'rotate_large': events.ROTARY_LARGE,
	'rotate_large_left': events.ROTARY_LARGE,
	'rotate_large_right': events.ROTARY_LARGE,
	'up_down': events.SWITCH,
	'down': events.SWITCH,
	'up': events.SWITCH,
	'left_right': events.SWITCH,
	'right': events.SWITCH,
	'left': events.SWITCH,
	'arrow': events.SWITCH
};

/**
 * @param params
 * @returns {string}
 */
function commandStrategy(params) {
	let event = eventsByCursorType[params[0]],
		command = params[1];

	return "\tEVENT_NAME " + event + "\r\n" +
		   "\tEVENT_CMND_DOWN " + command + "\r\n";
}

/**
 * @param params
 * @returns {string}
 */
function pushStrategy(params) {
	let event = eventsByCursorType[params[0]],
		v_down = parseFloat(params[1]),
		v_up = parseFloat(params[2]),
		dref = params[3];

	return "\tEVENT_NAME " + event + "\r\n" +
		"\tEVENT_START_COND " + dref + " = " + v_down +  "\r\n" +
		"\tEVENT_END_COND " + dref + " = " + v_up +  "\r\n" // TODO: This could be optional.
	;
}

/**
 * @param params
 * @returns {string}
 */
function toggleStrategy(params) {
	let event = eventsByCursorType[params[0]],
		v_on = params[1],
		v_off = params[2],
		dref = params[3];

	return "\tEVENT_NAME " + event + "\r\n" +
		"\tEVENT_START_COND ABS_DELTA=" + dref + " > 0\r\n" +
		"\tEVENT_END_COND ABS_DELTA=" + dref + " = 0\r\n" // TODO: this could be optional
		;
}

/**
 * @param params
 * @returns {string}
 */
function deltaStrategy(params) {
	let event = eventsByCursorType[params[0]],
		v_down = parseFloat(params[1]),
		v_hold = params[2],
		v_min = params[3],
		v_max = params[4],
		dref = params[5]
	;

	return "\tEVENT_NAME " + event + "\r\n" +
		"\tEVENT_START_COND DELTA=" + dref + (v_down > 0 ? " >= " + v_down : " <= " + v_down ) + "\r\n" +
		"\tEVENT_END_COND DELTA=" + dref + " = 0\r\n"
		;
}

/**
 * Which strategy function should be used with which manipulator type
 * @see http://developer.x-plane.com/?article=obj8-file-format-specification
 * @see http://developer.x-plane.com/?article=sound-snd-file-format-specification
 * @type {object}
 */
const strategiesByManipType = {
	'ATTR_manip_command': commandStrategy,
	// 'ATTR_manip_command_axis': function() {}, // TODO
	'ATTR_manip_push': pushStrategy,
	'ATTR_manip_toggle': toggleStrategy,
	'ATTR_manip_delta': deltaStrategy,
	'ATTR_manip_wrap': deltaStrategy,
	// 'ATTR_manip_wheel': function() {}, // TODO, requires knowledge of the previous command
	// 'ATTR_manip_command_knob': function() {}, // TODO
	// 'ATTR_manip_switch_up_down': function() {}, // TODO
	// 'ATTR_manip_switch_left_right': function() {}, // TODO
	// 'ATTR_manip_axis_knob': function() {}, // TODO
	// 'ATTR_manip_axis_switch_up_down': function() {}, // TODO
	// 'ATTR_manip_axis_switch_left_right': function() {}, // TODO
};

/**
 * Read valid lines from .obj filename
 * @param filename
 * @returns Array {idx: number, text: string}
 */
function getManips(filename) {
	let ret = [];
	let lines = fs.readFileSync(filename).toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
	for (let i = 0; i < lines.length; i++) {
		let l = lines[i];
		l = l.trim();
		if (l.includes('ATTR_manip')) {
			ret.push({
				idx: i + 1,
				text: l
			});
		}
	}
	return ret;
}

/**
 * Creates the text structure
 * @param content
 * @returns {string}
 */
function buildAttachmentDefinition(content) {
	return "BEGIN_SOUND_ATTACHMENT\r\n" +
	"\tVEH_PART cockpit 0\r\n" +
	content +
	"END_SOUND_ATTACHMENT\r\n";
}

/**
 * Build attachments for a manipulator
 * @param line
 * @returns {*}
 */
function buildAttachmentsForManip(line) {
	let
		ret = null,
		parts = line.text.split(/\s+/g),
		manipType = parts[0],
		strategyFn = strategiesByManipType[manipType]
	;
	if (strategyFn) {
		ret = "# " + filename + " line " + line.idx + " (" + manipType + " " + parts[1] + ")\r\n" +
			buildAttachmentDefinition(strategyFn(parts.slice(1)))
	}
	return ret;
}

let filename;

Commander
	.version('1.0.0')
	.usage('<input.obj> > <output.snd>')
	.arguments('<ObjFilename>')
	.action(function (ObjFilename) {
		filename = ObjFilename;
	})
	.parse(process.argv);

if (typeof filename === 'undefined') {
	console.error('No input file specified!');
	Commander.outputHelp();
	process.exit(1);
}

let manips = getManips(filename);
console.log(`# Read ${manips.length} manipulators from file ${filename}.`);
let attachments = manips.map(manip => buildAttachmentsForManip(manip)).filter(att => {
	return att !== null
});
console.log(`# Built ${attachments.length} attachments.`);
console.log();
attachments.forEach(att => console.log(att));
process.exit(0);
