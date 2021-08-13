/* eslint-disable @typescript-eslint/camelcase */

import { debug as log, getInput, setFailed, setOutput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

// Helper function to retrieve ticket number from a string (either a shorthand reference or a full URL)
const extractIds = (value: string, prefix: string): string[] | null => {
  return value.match("/"+prefix + "\d+/gmi");
};

const debug = (label: string, message: string): void => {
  log('');
  log(`[${label.toUpperCase()}]`);
  log(message);
  log('');
};

async function run(): Promise<void> {
  try {
    // Provide complete context object right away if debugging
    debug('context', JSON.stringify(context));

    const ticketPrefix = getInput('ticket-prefix', { required: true });


    // Check for a ticket reference in the title
    const title: string = context?.payload?.pull_request?.title;
    const titleRegexBase = getInput('title-regex', { required: true });
    const titleRegexFlags = getInput('title-regex-flags', {
      required: true
    });

    const titleRegexErrMsg = getInput('title-regex-errormessage', { required: false });
    const titleRegex = new RegExp(titleRegexBase, titleRegexFlags);
    const titleCheck = titleRegex.exec(title);

    // Check for a ticket reference in the branch
    const branch: string = context.payload.pull_request?.head.ref;
    const branchRegexBase = getInput('branch-regex', { required: true });
    const branchRegexFlags = getInput('branch-regex-flags', {
      required: true
    });
    const branchRegex = new RegExp(branchRegexBase, branchRegexFlags);
    const branchCheck = branchRegex.exec(branch);
    const branchRegexErrMsg = getInput('branch-regex-errormessage', { required: false });

    debug('title', title);

    // Error if title can't be checked with regex
    if (titleCheck === null) {
      setFailed(titleRegexErrMsg);
    }

    debug('branch name', branch);

    // Error if branch name can't be checked with regex
    if (branchCheck !== null) {
      setFailed(branchRegexErrMsg);
    }

    //Checks if there is a match between branch and title tickets IDs
    const branchTicketsIds = extractIds(branch, ticketPrefix);
    const titleTicketsIds = extractIds(title, ticketPrefix);

    if(branchTicketsIds === null ) {
      setFailed("No ticket ID found in branch name");
    }

    if(titleTicketsIds === null) {
      setFailed("No ticket ID found in title");
    }

  } catch (error) {
    setFailed(error.message);
  }
}

run();