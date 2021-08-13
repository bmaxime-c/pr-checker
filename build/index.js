"use strict";
/* eslint-disable @typescript-eslint/camelcase */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
// Helper function to retrieve ticket number from a string (either a shorthand reference or a full URL)
const extractIds = (value, prefix) => {
    return value.match("/" + prefix + "\d+/gmi");
};
const debug = (label, message) => {
    core_1.debug('');
    core_1.debug(`[${label.toUpperCase()}]`);
    core_1.debug(message);
    core_1.debug('');
};
async function run() {
    var _a, _b, _c;
    try {
        // Provide complete context object right away if debugging
        debug('context', JSON.stringify(github_1.context));
        const ticketPrefix = core_1.getInput('ticket-prefix', { required: true });
        // Check for a ticket reference in the title
        const title = (_b = (_a = github_1.context === null || github_1.context === void 0 ? void 0 : github_1.context.payload) === null || _a === void 0 ? void 0 : _a.pull_request) === null || _b === void 0 ? void 0 : _b.title;
        const titleRegexBase = core_1.getInput('title-regex', { required: true });
        const titleRegexFlags = core_1.getInput('title-regex-flags', {
            required: true
        });
        const titleRegexErrMsg = core_1.getInput('title-regex-errormessage', { required: false });
        const titleRegex = new RegExp(titleRegexBase, titleRegexFlags);
        const titleCheck = titleRegex.exec(title);
        // Check for a ticket reference in the branch
        const branch = (_c = github_1.context.payload.pull_request) === null || _c === void 0 ? void 0 : _c.head.ref;
        const branchRegexBase = core_1.getInput('branch-regex', { required: true });
        const branchRegexFlags = core_1.getInput('branch-regex-flags', {
            required: true
        });
        const branchRegex = new RegExp(branchRegexBase, branchRegexFlags);
        const branchCheck = branchRegex.exec(branch);
        const branchRegexErrMsg = core_1.getInput('branch-regex-errormessage', { required: false });
        debug('title', title);
        // Error if title can't be checked with regex
        if (titleCheck === null) {
            core_1.setFailed(titleRegexErrMsg);
        }
        debug('branch name', branch);
        // Error if branch name can't be checked with regex
        if (branchCheck !== null) {
            core_1.setFailed(branchRegexErrMsg);
        }
        //Checks if there is a match between branch and title tickets IDs
        const branchTicketsIds = extractIds(branch, ticketPrefix);
        const titleTicketsIds = extractIds(title, ticketPrefix);
        if (branchTicketsIds === null) {
            core_1.setFailed("No ticket ID found in branch name");
        }
        if (titleTicketsIds === null) {
            core_1.setFailed("No ticket ID found in title");
        }
    }
    catch (error) {
        core_1.setFailed(error.message);
    }
}
run();
