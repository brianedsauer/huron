const cwd = process.cwd(); // Current working directory
const path = require('path');
const fs = require('fs-extra');
const parse = require('kss').parse;
const chalk = require('chalk'); // Colorize terminal output

import { utils } from './utils';
import { writeStore }  from './require-templates';

export const kssHandler = {};

/**
 * Handle update of a KSS section
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} store - memory store
 */
kssHandler.updateKSS = function(filepath, store) {
  const kssSource = fs.readFileSync(filepath, 'utf8');
  const huron = store.get('config');
  const file = path.parse(filepath);

  if (kssSource) {
    const styleguide = parse(kssSource, huron.get('kssOptions'));

    if (styleguide.data.sections.length) {
      const section = utils.normalizeSectionData(styleguide.data.sections[0]);
      const oldData = utils.getSection(filepath, false, store);
      const inline = kssHandler.inlineTemplate(oldData, section);
      const description = kssHandler.description;
      const changed = false;

      // Set section value if inlineTempalte() returned a path
      if (inline) {
        section.inlineTemplate = inline;
      }

      if (description) {
        section.descriptionPath = description;
      }

      if (oldData && oldData !== section) {
        changed = filepath;
      }

      const newStore = kssHandler.updateSection(section, filepath, isInline, store);
      writeStore(newStore, changed);
      console.log(chalk.green(`KSS section ${section.referenceURI} file ${filepath} changed or added`));
      return newStore;
    } else {
      console.log(chalk.magenta(`No KSS found in ${filepath}`));
      return store;
    }
  } else {
    console.log(chalk.red(`${filepath} not found or empty`));
    return store;
  }
}

/**
 * Handle removal of a KSS section
 *
 * @param {string} filepath - filepath of changed file (comes from gaze)
 * @param {object} section - KSS section data
 * @param {object} store - memory store
 */
kssHandler.deleteKSS = function(filepath, section, store) {
  const isInline = section.markup.match(/<\/[^>]*>/) !== null;
  const huron = store.get('config');
  const file = path.parse(filepath);

  // Remove associated inline template
  if (isInline) {
    utils.removeFile(section.referenceURI, 'template', filepath, store);
  }

  // Remove description template
  utils.removeFile(section.referenceURI, 'description', filepath, store);

  // Remove section data from memory store
  return unsetSection(sections, section, filepath);
}

/**
 * Handle detection and output of inline templates, which is
 * markup written in the KSS documentation itself as opposed to an external file
 *
 * @param {string} oldData - previous iteration of KSS data, if updated
 * @param {object} section - KSS section data
 *
 * @return {mixed} output template path or false
 */
kssHandler.inlineTemplate = function(oldData, section) {
  const isInline = section.markup.match(/<\/[^>]*>/) !== null;

  // If we have inline markup
  if (isInline) {
    // Remove old template if referenceURI has changed
    if (oldData && oldData.referenceURI !== section.referenceURI) {
      utils.removeFile(oldData.referenceURI, 'template', filepath, store);
    }

    return utils.writeFile(section.referenceURI, 'template', filepath, section.markup, store);;
  }

  return false;
}

/**
 * Handle output of section description
 *
 * @param {string} oldData - previous iteration of KSS data, if updated
 * @param {object} section - KSS section data
 *
 * @return {mixed} output description path or false
 */
kssHandler.description = function(oldData, section) {
  // If we don't have previous KSS or the KSS has been updated
  if ((oldData && oldData.description !== section.description) || !oldData) {
    // Remove old description if referenceURI has changed
    if (oldData && oldData.referenceURI !== section.referenceURI) {
       utils.removeFile(oldData.referenceURI, 'description', filepath, store);
    }
    // Write new description
    return utils.writeFile(section.referenceURI, 'description', filepath, section.description, store);
  }

  return false;
}

/**
 * Update the sections store with new data for a specific section
 *
 * @param {object} section - contains updated section data
 * @param {string} kssPath - path to KSS section
 * @param {bool} isInline - is the markup inline in KSS?
 * @param {object} store - memory store
 */
kssHandler.updateSection = function(section, kssPath, isInline, store) {
  const huron = store.get('config');
  const oldData = utils.getSection(kssPath, false, store);
  const sectionMarkup = section.markup;
  const sectionFileInfo = path.parse(kssPath);
  let resetData = null;
  let newSort = kssHandler.sortSection(
    store.getIn(['sections', 'sorted']),
    section.referenceURI
  );

  // Store section data based on filepath so we can garbage-collect references
  // in the future
  if (oldData) {
    // If section exists, merge section data
    resetData = Object.assign({}, oldData, section);
    newSort = kssHandler.unsortSection(newSort, oldData.referenceURI);
  } else {
    // If section does not exist, set the new section
    resetData = section;
  }

  // Required for reference from templates and data
  resetData.kssPath = kssPath;

  // Update section sorting
  return store
    .setIn(
      ['sections', 'sectionsByPath', kssPath],
      resetData
    )
    .setIn(
      ['sections', 'sorted'],
      newSort
    );
}

/**
 * Remove a section from the memory store
 *
 * @param {object} section - contains updated section data
 * @param {string} kssPath - path to KSS section
 * @param {object} store - memory store
 */
kssHandler.unsetSection = function(section, kssPath, store) {
  const newSort = kssHandler.unsortSection(sorted, section.referenceURI);
  return store
    .deleteIn(['sections', 'sectionsByPath', kssPath])
    .setIn(['sections', 'sorted'], newSort);
}

/**
 * Sort sections and subsections
 *
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 */
kssHandler.sortSection = function(sorted, reference) {
  let parts = reference.split('-');
  let newSort = sorted[parts[0]] || {};

  if (parts.length > 1) {
    let newParts = parts.filter((part, idx) => {
      return idx !== 0;
    });
    sorted[parts[0]] = kssHandler.sortSection(newSort, newParts.join('-'));
  } else {
    sorted[parts[0]] = newSort;
  }

  return sorted;
}

/**
 * Remove a section from the sorted sections
 *
 * @param {object} sorted - currently sorted sections
 * @param {string} reference - reference URI of section to sort
 */
kssHandler.unsortSection = function(sorted, reference) {
  let parts = reference.split('-');

  if (sorted[parts[0]]) {
    if (parts.length > 1) {
      let newParts = parts.filter((part, idx) => {
        return idx !== 0;
      });
      sorted = kssHandler.unsortSection(sorted[parts[0]], newParts.join('-'));
    } else {
      delete sorted[parts[0]];
    }
  }

  return sorted;
}