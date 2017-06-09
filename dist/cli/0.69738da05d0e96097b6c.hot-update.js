exports.id = 0;
exports.modules = {

/***/ "./src/cli/utils.js":
/* no static exports found */
/* all exports used */
/*!**************************!*\
  !*** ./src/cli/utils.js ***!
  \**************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n/** @module cli/utilities */\n\nconst cwd = process.cwd(); // Current working directory\nconst path = __webpack_require__(/*! path */ 0);\nconst fs = __webpack_require__(/*! fs-extra */ 2);\nconst chalk = __webpack_require__(/*! chalk */ 1); // Colorize terminal output\n\n// Exports\n/* eslint-disable */\nconst utils = exports.utils = {\n  /* eslint-enable */\n\n  /**\n   * Ensure predictable data structure for KSS section data\n   *\n   * @function normalizeSectionData\n   * @param {object} section - section data\n   * @return {object} section data\n   */\n  normalizeSectionData(section) {\n    const data = section.data || section;\n\n    if (!data.referenceURI || '' === data.referenceURI) {\n      data.referenceURI = section.referenceURI();\n    }\n\n    return data;\n  },\n\n  /**\n   * Ensure predictable data structure for KSS section data\n   *\n   * @function writeSectionData\n   * @param {object} store - data store\n   * @param {object} section - section data\n   * @param {string} sectionPath - output destination for section data file\n   */\n  writeSectionData(store, section, sectionPath = false) {\n    let outputPath = sectionPath;\n    let sectionFileInfo;\n\n    if (!outputPath && {}.hasOwnProperty.call(section, 'kssPath')) {\n      sectionFileInfo = path.parse(section.kssPath);\n      outputPath = path.join(sectionFileInfo.dir, `${ sectionFileInfo.name }.json`);\n    }\n\n    // Output section data\n    if (outputPath) {\n      return utils.writeFile(section.referenceURI, 'section', outputPath, JSON.stringify(section), store);\n    }\n\n    console.warn( // eslint-disable-line no-console\n    chalk.red(`Failed to write section data for ${ section.referenceURI }`));\n    return false;\n  },\n\n  /**\n   * Find .json from a template file or vice versa\n   *\n   * @function getTemplateDataPair\n   * @param {object} file - file object from path.parse()\n   * @param {object} section - KSS section data\n   * @return {string} relative path to module JSON file\n   */\n  getTemplateDataPair(file, section, store) {\n    const huron = store.get('config');\n    const kssDir = utils.matchKssDir(file.dir, huron);\n\n    if (kssDir) {\n      const componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);\n      const partnerType = '.json' === file.ext ? 'template' : 'data';\n      const partnerExt = '.json' === file.ext ? huron.get('templates').extension : '.json';\n\n      const pairPath = path.join(componentPath, utils.generateFilename(section.referenceURI, partnerType, partnerExt, store));\n\n      return `./${ pairPath }`;\n    }\n\n    return false;\n  },\n\n  /**\n   * Normalize a section title for use as a filename\n   *\n   * @function normalizeHeader\n   * @param {string} header - section header extracted from KSS documentation\n   * @return {string} modified header, lowercase and words separated by dash\n   */\n  normalizeHeader(header) {\n    return header.toLowerCase().replace(/\\s?\\W\\s?/g, '-');\n  },\n\n  /**\n   * Wrap html in required template tags\n   *\n   * @function wrapMarkup\n   * @param {string} content - html or template markup\n   * @param {string} templateId - id of template (should be section reference)\n   * @return {string} modified HTML\n   */\n  wrapMarkup(content, templateId) {\n    return `<dom-module>\n<template id=\"${ templateId }\">\n${ content }\n</template>\n</dom-module>\\n`;\n  },\n\n  /**\n   * Generate a filename based on referenceURI, type and file object\n   *\n   * @function generateFilename\n   * @param  {string} id - The name of the file (with extension).\n   * @param  {string} type - the type of file output\n   * @param  {object} ext - file extension\n   * @param  {store} store - data store\n   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)\n   */\n  generateFilename(id, type, ext, store) {\n    // Type of file and its corresponding extension(s)\n    const types = store.get('types');\n    const outputExt = '.scss' !== ext ? ext : '.html';\n\n    /* eslint-disable */\n    if (-1 === types.indexOf(type)) {\n      console.log(`Huron data ${ type } does not exist`);\n      return false;\n    }\n    /* eslint-enable */\n\n    return `${ id }-${ type }${ outputExt }`;\n  },\n\n  /**\n   * Copy an HTML file into the huron output directory.\n   *\n   * @function writeFile\n   * @param  {string} id - The name of the file (with extension).\n   * @param  {string} content - The content of the file to write.\n   * @param  {string} type - the type of file output\n   * @param  {object} store - The data store\n   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)\n   */\n  writeFile(id, type, filepath, content, store) {\n    const huron = store.get('config');\n    const file = path.parse(filepath);\n    const filename = utils.generateFilename(id, type, file.ext, store);\n    const kssDir = utils.matchKssDir(filepath, huron);\n\n    if (kssDir) {\n      const componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);\n      const outputRelative = path.join(huron.get('output'), componentPath, `${ filename }`);\n      const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);\n      let newContent = content;\n\n      if ('data' !== type && 'section' !== type) {\n        newContent = utils.wrapMarkup(content, id);\n      }\n\n      try {\n        fs.outputFileSync(outputPath, newContent);\n        console.log(chalk.green(`Writing ${ outputRelative }`)); // eslint-disable-line no-console\n      } catch (e) {\n        console.log(chalk.red(`Failed to write ${ outputRelative }`)); // eslint-disable-line no-console\n      }\n\n      return `./${ outputRelative.replace(`${ huron.get('output') }/`, '') }`;\n    }\n\n    return false;\n  },\n\n  /**\n   * Delete a file in the huron output directory\n   *\n   * @function removeFile\n   * @param  {string} filename - The name of the file (with extension).\n   * @param  {object} store - The data store\n   * @return {string} Path to output file, relative to ouput dir (can be use in require statements)\n   */\n  removeFile(id, type, filepath, store) {\n    const huron = store.get('config');\n    const file = path.parse(filepath);\n    const filename = utils.generateFilename(id, type, file.ext, store);\n    const kssDir = utils.matchKssDir(filepath, huron);\n\n    if (kssDir) {\n      const componentPath = path.relative(path.resolve(cwd, kssDir), file.dir);\n      const outputRelative = path.join(huron.get('output'), componentPath, `${ filename }`);\n      const outputPath = path.resolve(cwd, huron.get('root'), outputRelative);\n\n      try {\n        fs.removeSync(outputPath);\n        console.log(chalk.green(`Removing ${ outputRelative }`)); // eslint-disable-line no-console\n      } catch (e) {\n        console.log( // eslint-disable-line no-console\n        chalk.red(`${ outputRelative } does not exist or cannot be deleted`));\n      }\n\n      return `./${ outputRelative.replace(`${ huron.get('output') }/`, '') }`;\n    }\n\n    return false;\n  },\n\n  /**\n   * Write a template for sections\n   *\n   * @function writeSectionTemplate\n   * @param  {string} filepath - the original template file\n   * @param  {object} store - data store\n   * @return {object} updated store\n   */\n  writeSectionTemplate(filepath, store) {\n    const huron = store.get('config');\n    const sectionTemplate = utils.wrapMarkup(fs.readFileSync(filepath, 'utf8'));\n    const componentPath = './huron-sections/sections.hbs';\n    const output = path.join(cwd, huron.get('root'), huron.get('output'), componentPath);\n\n    // Move huron script and section template into huron root\n    fs.outputFileSync(output, sectionTemplate);\n    console.log(chalk.green(`writing section template to ${ output }`)); // eslint-disable-line no-console\n\n    return store.set('sectionTemplatePath', componentPath);\n  },\n\n  /**\n   * Request for section data based on section reference\n   *\n   * @function writeSectionTemplate\n   * @param {string} search - key on which to match section\n   * @param {field} string - field in which to look to determine section\n   * @param {obj} store - sections memory store\n   */\n  getSection(search, field, store) {\n    const sectionValues = store.getIn(['sections', 'sectionsByPath']).valueSeq();\n    let selectedSection = false;\n\n    if (field) {\n      selectedSection = sectionValues.filter(value => value[field] === search).get(0);\n    } else {\n      selectedSection = store.getIn(['sections', 'sectionsByPath', search]);\n    }\n\n    return selectedSection;\n  },\n\n  /**\n   * Find which configured KSS directory a filepath exists in\n   *\n   * @function matchKssDir\n   * @param {string} filepath - filepath to search for\n   * @param {object} huron - huron configuration\n   * @return {string} kssMatch - relative path to KSS directory\n   */\n  matchKssDir(filepath, huron) {\n    const kssSource = huron.get('kss');\n    /* eslint-disable space-unary-ops */\n    // Include forward slash in our test to make sure we're matchin a directory, not a file extension\n    const kssMatch = kssSource.filter(dir => !filepath.includes(`${ dir }/`));\n    /* eslint-enable space-unary-ops */\n\n    if (kssMatch.length) {\n      return kssMatch[0];\n    }\n\n    console.error(chalk.red(`filepath ${ filepath } does not exist in any\n      of the configured KSS directories`));\n    return false;\n  }\n};//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY2xpL3V0aWxzLmpzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL3NyYy9jbGkvdXRpbHMuanM/ZTcxYyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQG1vZHVsZSBjbGkvdXRpbGl0aWVzICovXG5cbmNvbnN0IGN3ZCA9IHByb2Nlc3MuY3dkKCk7IC8vIEN1cnJlbnQgd29ya2luZyBkaXJlY3RvcnlcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5jb25zdCBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJyk7IC8vIENvbG9yaXplIHRlcm1pbmFsIG91dHB1dFxuXG4vLyBFeHBvcnRzXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuZXhwb3J0IGNvbnN0IHV0aWxzID0ge1xuLyogZXNsaW50LWVuYWJsZSAqL1xuXG4gIC8qKlxuICAgKiBFbnN1cmUgcHJlZGljdGFibGUgZGF0YSBzdHJ1Y3R1cmUgZm9yIEtTUyBzZWN0aW9uIGRhdGFcbiAgICpcbiAgICogQGZ1bmN0aW9uIG5vcm1hbGl6ZVNlY3Rpb25EYXRhXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gc2VjdGlvbiBkYXRhXG4gICAqIEByZXR1cm4ge29iamVjdH0gc2VjdGlvbiBkYXRhXG4gICAqL1xuICBub3JtYWxpemVTZWN0aW9uRGF0YShzZWN0aW9uKSB7XG4gICAgY29uc3QgZGF0YSA9IHNlY3Rpb24uZGF0YSB8fCBzZWN0aW9uO1xuXG4gICAgaWYgKCEgZGF0YS5yZWZlcmVuY2VVUkkgfHwgJycgPT09IGRhdGEucmVmZXJlbmNlVVJJKSB7XG4gICAgICBkYXRhLnJlZmVyZW5jZVVSSSA9IHNlY3Rpb24ucmVmZXJlbmNlVVJJKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEVuc3VyZSBwcmVkaWN0YWJsZSBkYXRhIHN0cnVjdHVyZSBmb3IgS1NTIHNlY3Rpb24gZGF0YVxuICAgKlxuICAgKiBAZnVuY3Rpb24gd3JpdGVTZWN0aW9uRGF0YVxuICAgKiBAcGFyYW0ge29iamVjdH0gc3RvcmUgLSBkYXRhIHN0b3JlXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIC0gc2VjdGlvbiBkYXRhXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzZWN0aW9uUGF0aCAtIG91dHB1dCBkZXN0aW5hdGlvbiBmb3Igc2VjdGlvbiBkYXRhIGZpbGVcbiAgICovXG4gIHdyaXRlU2VjdGlvbkRhdGEoc3RvcmUsIHNlY3Rpb24sIHNlY3Rpb25QYXRoID0gZmFsc2UpIHtcbiAgICBsZXQgb3V0cHV0UGF0aCA9IHNlY3Rpb25QYXRoO1xuICAgIGxldCBzZWN0aW9uRmlsZUluZm87XG5cbiAgICBpZiAoISBvdXRwdXRQYXRoICYmIHt9Lmhhc093blByb3BlcnR5LmNhbGwoc2VjdGlvbiwgJ2tzc1BhdGgnKSkge1xuICAgICAgc2VjdGlvbkZpbGVJbmZvID0gcGF0aC5wYXJzZShzZWN0aW9uLmtzc1BhdGgpO1xuICAgICAgb3V0cHV0UGF0aCA9IHBhdGguam9pbihcbiAgICAgICAgc2VjdGlvbkZpbGVJbmZvLmRpcixcbiAgICAgICAgYCR7c2VjdGlvbkZpbGVJbmZvLm5hbWV9Lmpzb25gXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIE91dHB1dCBzZWN0aW9uIGRhdGFcbiAgICBpZiAob3V0cHV0UGF0aCkge1xuICAgICAgcmV0dXJuIHV0aWxzLndyaXRlRmlsZShcbiAgICAgICAgc2VjdGlvbi5yZWZlcmVuY2VVUkksXG4gICAgICAgICdzZWN0aW9uJyxcbiAgICAgICAgb3V0cHV0UGF0aCxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoc2VjdGlvbiksXG4gICAgICAgIHN0b3JlXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnNvbGUud2FybiggLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICBjaGFsay5yZWQoYEZhaWxlZCB0byB3cml0ZSBzZWN0aW9uIGRhdGEgZm9yICR7c2VjdGlvbi5yZWZlcmVuY2VVUkl9YClcbiAgICApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogRmluZCAuanNvbiBmcm9tIGEgdGVtcGxhdGUgZmlsZSBvciB2aWNlIHZlcnNhXG4gICAqXG4gICAqIEBmdW5jdGlvbiBnZXRUZW1wbGF0ZURhdGFQYWlyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlIC0gZmlsZSBvYmplY3QgZnJvbSBwYXRoLnBhcnNlKClcbiAgICogQHBhcmFtIHtvYmplY3R9IHNlY3Rpb24gLSBLU1Mgc2VjdGlvbiBkYXRhXG4gICAqIEByZXR1cm4ge3N0cmluZ30gcmVsYXRpdmUgcGF0aCB0byBtb2R1bGUgSlNPTiBmaWxlXG4gICAqL1xuICBnZXRUZW1wbGF0ZURhdGFQYWlyKGZpbGUsIHNlY3Rpb24sIHN0b3JlKSB7XG4gICAgY29uc3QgaHVyb24gPSBzdG9yZS5nZXQoJ2NvbmZpZycpO1xuICAgIGNvbnN0IGtzc0RpciA9IHV0aWxzLm1hdGNoS3NzRGlyKGZpbGUuZGlyLCBodXJvbik7XG5cbiAgICBpZiAoa3NzRGlyKSB7XG4gICAgICBjb25zdCBjb21wb25lbnRQYXRoID0gcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgcGF0aC5yZXNvbHZlKGN3ZCwga3NzRGlyKSxcbiAgICAgICAgZmlsZS5kaXJcbiAgICAgICk7XG4gICAgICBjb25zdCBwYXJ0bmVyVHlwZSA9ICcuanNvbicgPT09IGZpbGUuZXh0ID8gJ3RlbXBsYXRlJyA6ICdkYXRhJztcbiAgICAgIGNvbnN0IHBhcnRuZXJFeHQgPSAnLmpzb24nID09PSBmaWxlLmV4dCA/XG4gICAgICAgIGh1cm9uLmdldCgndGVtcGxhdGVzJykuZXh0ZW5zaW9uIDpcbiAgICAgICAgJy5qc29uJztcblxuICAgICAgY29uc3QgcGFpclBhdGggPSBwYXRoLmpvaW4oXG4gICAgICAgIGNvbXBvbmVudFBhdGgsXG4gICAgICAgIHV0aWxzLmdlbmVyYXRlRmlsZW5hbWUoXG4gICAgICAgICAgc2VjdGlvbi5yZWZlcmVuY2VVUkksXG4gICAgICAgICAgcGFydG5lclR5cGUsXG4gICAgICAgICAgcGFydG5lckV4dCxcbiAgICAgICAgICBzdG9yZVxuICAgICAgICApXG4gICAgICApO1xuXG4gICAgICByZXR1cm4gYC4vJHtwYWlyUGF0aH1gO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogTm9ybWFsaXplIGEgc2VjdGlvbiB0aXRsZSBmb3IgdXNlIGFzIGEgZmlsZW5hbWVcbiAgICpcbiAgICogQGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyIC0gc2VjdGlvbiBoZWFkZXIgZXh0cmFjdGVkIGZyb20gS1NTIGRvY3VtZW50YXRpb25cbiAgICogQHJldHVybiB7c3RyaW5nfSBtb2RpZmllZCBoZWFkZXIsIGxvd2VyY2FzZSBhbmQgd29yZHMgc2VwYXJhdGVkIGJ5IGRhc2hcbiAgICovXG4gIG5vcm1hbGl6ZUhlYWRlcihoZWFkZXIpIHtcbiAgICByZXR1cm4gaGVhZGVyXG4gICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgLnJlcGxhY2UoL1xccz9cXFdcXHM/L2csICctJyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdyYXAgaHRtbCBpbiByZXF1aXJlZCB0ZW1wbGF0ZSB0YWdzXG4gICAqXG4gICAqIEBmdW5jdGlvbiB3cmFwTWFya3VwXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IC0gaHRtbCBvciB0ZW1wbGF0ZSBtYXJrdXBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRlbXBsYXRlSWQgLSBpZCBvZiB0ZW1wbGF0ZSAoc2hvdWxkIGJlIHNlY3Rpb24gcmVmZXJlbmNlKVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IG1vZGlmaWVkIEhUTUxcbiAgICovXG4gIHdyYXBNYXJrdXAoY29udGVudCwgdGVtcGxhdGVJZCkge1xuICAgIHJldHVybiBgPGRvbS1tb2R1bGU+XG48dGVtcGxhdGUgaWQ9XCIke3RlbXBsYXRlSWR9XCI+XG4ke2NvbnRlbnR9XG48L3RlbXBsYXRlPlxuPC9kb20tbW9kdWxlPlxcbmA7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgZmlsZW5hbWUgYmFzZWQgb24gcmVmZXJlbmNlVVJJLCB0eXBlIGFuZCBmaWxlIG9iamVjdFxuICAgKlxuICAgKiBAZnVuY3Rpb24gZ2VuZXJhdGVGaWxlbmFtZVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGlkIC0gVGhlIG5hbWUgb2YgdGhlIGZpbGUgKHdpdGggZXh0ZW5zaW9uKS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSB0eXBlIC0gdGhlIHR5cGUgb2YgZmlsZSBvdXRwdXRcbiAgICogQHBhcmFtICB7b2JqZWN0fSBleHQgLSBmaWxlIGV4dGVuc2lvblxuICAgKiBAcGFyYW0gIHtzdG9yZX0gc3RvcmUgLSBkYXRhIHN0b3JlXG4gICAqIEByZXR1cm4ge3N0cmluZ30gUGF0aCB0byBvdXRwdXQgZmlsZSwgcmVsYXRpdmUgdG8gb3VwdXQgZGlyIChjYW4gYmUgdXNlIGluIHJlcXVpcmUgc3RhdGVtZW50cylcbiAgICovXG4gIGdlbmVyYXRlRmlsZW5hbWUoaWQsIHR5cGUsIGV4dCwgc3RvcmUpIHtcbiAgICAvLyBUeXBlIG9mIGZpbGUgYW5kIGl0cyBjb3JyZXNwb25kaW5nIGV4dGVuc2lvbihzKVxuICAgIGNvbnN0IHR5cGVzID0gc3RvcmUuZ2V0KCd0eXBlcycpO1xuICAgIGNvbnN0IG91dHB1dEV4dCA9ICcuc2NzcycgIT09IGV4dCA/IGV4dCA6ICcuaHRtbCc7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSAqL1xuICAgIGlmICgtMSA9PT0gdHlwZXMuaW5kZXhPZih0eXBlKSkge1xuICAgICAgY29uc29sZS5sb2coYEh1cm9uIGRhdGEgJHt0eXBlfSBkb2VzIG5vdCBleGlzdGApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlICovXG5cbiAgICByZXR1cm4gYCR7aWR9LSR7dHlwZX0ke291dHB1dEV4dH1gO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDb3B5IGFuIEhUTUwgZmlsZSBpbnRvIHRoZSBodXJvbiBvdXRwdXQgZGlyZWN0b3J5LlxuICAgKlxuICAgKiBAZnVuY3Rpb24gd3JpdGVGaWxlXG4gICAqIEBwYXJhbSAge3N0cmluZ30gaWQgLSBUaGUgbmFtZSBvZiB0aGUgZmlsZSAod2l0aCBleHRlbnNpb24pLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGNvbnRlbnQgLSBUaGUgY29udGVudCBvZiB0aGUgZmlsZSB0byB3cml0ZS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSB0eXBlIC0gdGhlIHR5cGUgb2YgZmlsZSBvdXRwdXRcbiAgICogQHBhcmFtICB7b2JqZWN0fSBzdG9yZSAtIFRoZSBkYXRhIHN0b3JlXG4gICAqIEByZXR1cm4ge3N0cmluZ30gUGF0aCB0byBvdXRwdXQgZmlsZSwgcmVsYXRpdmUgdG8gb3VwdXQgZGlyIChjYW4gYmUgdXNlIGluIHJlcXVpcmUgc3RhdGVtZW50cylcbiAgICovXG4gIHdyaXRlRmlsZShpZCwgdHlwZSwgZmlsZXBhdGgsIGNvbnRlbnQsIHN0b3JlKSB7XG4gICAgY29uc3QgaHVyb24gPSBzdG9yZS5nZXQoJ2NvbmZpZycpO1xuICAgIGNvbnN0IGZpbGUgPSBwYXRoLnBhcnNlKGZpbGVwYXRoKTtcbiAgICBjb25zdCBmaWxlbmFtZSA9IHV0aWxzLmdlbmVyYXRlRmlsZW5hbWUoaWQsIHR5cGUsIGZpbGUuZXh0LCBzdG9yZSk7XG4gICAgY29uc3Qga3NzRGlyID0gdXRpbHMubWF0Y2hLc3NEaXIoZmlsZXBhdGgsIGh1cm9uKTtcblxuICAgIGlmIChrc3NEaXIpIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudFBhdGggPSBwYXRoLnJlbGF0aXZlKFxuICAgICAgICBwYXRoLnJlc29sdmUoY3dkLCBrc3NEaXIpLFxuICAgICAgICBmaWxlLmRpclxuICAgICAgKTtcbiAgICAgIGNvbnN0IG91dHB1dFJlbGF0aXZlID0gcGF0aC5qb2luKFxuICAgICAgICBodXJvbi5nZXQoJ291dHB1dCcpLFxuICAgICAgICBjb21wb25lbnRQYXRoLFxuICAgICAgICBgJHtmaWxlbmFtZX1gXG4gICAgICApO1xuICAgICAgY29uc3Qgb3V0cHV0UGF0aCA9IHBhdGgucmVzb2x2ZShjd2QsIGh1cm9uLmdldCgncm9vdCcpLCBvdXRwdXRSZWxhdGl2ZSk7XG4gICAgICBsZXQgbmV3Q29udGVudCA9IGNvbnRlbnQ7XG5cbiAgICAgIGlmICgnZGF0YScgIT09IHR5cGUgJiYgJ3NlY3Rpb24nICE9PSB0eXBlKSB7XG4gICAgICAgIG5ld0NvbnRlbnQgPSB1dGlscy53cmFwTWFya3VwKGNvbnRlbnQsIGlkKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMub3V0cHV0RmlsZVN5bmMob3V0cHV0UGF0aCwgbmV3Q29udGVudCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGNoYWxrLmdyZWVuKGBXcml0aW5nICR7b3V0cHV0UmVsYXRpdmV9YCkpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coY2hhbGsucmVkKGBGYWlsZWQgdG8gd3JpdGUgJHtvdXRwdXRSZWxhdGl2ZX1gKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gYC4vJHtvdXRwdXRSZWxhdGl2ZS5yZXBsYWNlKGAke2h1cm9uLmdldCgnb3V0cHV0Jyl9L2AsICcnKX1gO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIGEgZmlsZSBpbiB0aGUgaHVyb24gb3V0cHV0IGRpcmVjdG9yeVxuICAgKlxuICAgKiBAZnVuY3Rpb24gcmVtb3ZlRmlsZVxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGZpbGVuYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGZpbGUgKHdpdGggZXh0ZW5zaW9uKS5cbiAgICogQHBhcmFtICB7b2JqZWN0fSBzdG9yZSAtIFRoZSBkYXRhIHN0b3JlXG4gICAqIEByZXR1cm4ge3N0cmluZ30gUGF0aCB0byBvdXRwdXQgZmlsZSwgcmVsYXRpdmUgdG8gb3VwdXQgZGlyIChjYW4gYmUgdXNlIGluIHJlcXVpcmUgc3RhdGVtZW50cylcbiAgICovXG4gIHJlbW92ZUZpbGUoaWQsIHR5cGUsIGZpbGVwYXRoLCBzdG9yZSkge1xuICAgIGNvbnN0IGh1cm9uID0gc3RvcmUuZ2V0KCdjb25maWcnKTtcbiAgICBjb25zdCBmaWxlID0gcGF0aC5wYXJzZShmaWxlcGF0aCk7XG4gICAgY29uc3QgZmlsZW5hbWUgPSB1dGlscy5nZW5lcmF0ZUZpbGVuYW1lKGlkLCB0eXBlLCBmaWxlLmV4dCwgc3RvcmUpO1xuICAgIGNvbnN0IGtzc0RpciA9IHV0aWxzLm1hdGNoS3NzRGlyKGZpbGVwYXRoLCBodXJvbik7XG5cbiAgICBpZiAoa3NzRGlyKSB7XG4gICAgICBjb25zdCBjb21wb25lbnRQYXRoID0gcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgcGF0aC5yZXNvbHZlKGN3ZCwga3NzRGlyKSxcbiAgICAgICAgZmlsZS5kaXJcbiAgICAgICk7XG4gICAgICBjb25zdCBvdXRwdXRSZWxhdGl2ZSA9IHBhdGguam9pbihcbiAgICAgICAgaHVyb24uZ2V0KCdvdXRwdXQnKSxcbiAgICAgICAgY29tcG9uZW50UGF0aCxcbiAgICAgICAgYCR7ZmlsZW5hbWV9YFxuICAgICAgKTtcbiAgICAgIGNvbnN0IG91dHB1dFBhdGggPSBwYXRoLnJlc29sdmUoY3dkLCBodXJvbi5nZXQoJ3Jvb3QnKSwgb3V0cHV0UmVsYXRpdmUpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBmcy5yZW1vdmVTeW5jKG91dHB1dFBhdGgpO1xuICAgICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbihgUmVtb3ZpbmcgJHtvdXRwdXRSZWxhdGl2ZX1gKSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyggLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgY2hhbGsucmVkKGAke291dHB1dFJlbGF0aXZlfSBkb2VzIG5vdCBleGlzdCBvciBjYW5ub3QgYmUgZGVsZXRlZGApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBgLi8ke291dHB1dFJlbGF0aXZlLnJlcGxhY2UoYCR7aHVyb24uZ2V0KCdvdXRwdXQnKX0vYCwgJycpfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBXcml0ZSBhIHRlbXBsYXRlIGZvciBzZWN0aW9uc1xuICAgKlxuICAgKiBAZnVuY3Rpb24gd3JpdGVTZWN0aW9uVGVtcGxhdGVcbiAgICogQHBhcmFtICB7c3RyaW5nfSBmaWxlcGF0aCAtIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBmaWxlXG4gICAqIEBwYXJhbSAge29iamVjdH0gc3RvcmUgLSBkYXRhIHN0b3JlXG4gICAqIEByZXR1cm4ge29iamVjdH0gdXBkYXRlZCBzdG9yZVxuICAgKi9cbiAgd3JpdGVTZWN0aW9uVGVtcGxhdGUoZmlsZXBhdGgsIHN0b3JlKSB7XG4gICAgY29uc3QgaHVyb24gPSBzdG9yZS5nZXQoJ2NvbmZpZycpO1xuICAgIGNvbnN0IHNlY3Rpb25UZW1wbGF0ZSA9IHV0aWxzLndyYXBNYXJrdXAoZnMucmVhZEZpbGVTeW5jKGZpbGVwYXRoLCAndXRmOCcpKTtcbiAgICBjb25zdCBjb21wb25lbnRQYXRoID0gJy4vaHVyb24tc2VjdGlvbnMvc2VjdGlvbnMuaGJzJztcbiAgICBjb25zdCBvdXRwdXQgPSBwYXRoLmpvaW4oXG4gICAgICBjd2QsXG4gICAgICBodXJvbi5nZXQoJ3Jvb3QnKSxcbiAgICAgIGh1cm9uLmdldCgnb3V0cHV0JyksXG4gICAgICBjb21wb25lbnRQYXRoXG4gICAgKTtcblxuICAgIC8vIE1vdmUgaHVyb24gc2NyaXB0IGFuZCBzZWN0aW9uIHRlbXBsYXRlIGludG8gaHVyb24gcm9vdFxuICAgIGZzLm91dHB1dEZpbGVTeW5jKG91dHB1dCwgc2VjdGlvblRlbXBsYXRlKTtcbiAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbihgd3JpdGluZyBzZWN0aW9uIHRlbXBsYXRlIHRvICR7b3V0cHV0fWApKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG5cbiAgICByZXR1cm4gc3RvcmUuc2V0KCdzZWN0aW9uVGVtcGxhdGVQYXRoJywgY29tcG9uZW50UGF0aCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcXVlc3QgZm9yIHNlY3Rpb24gZGF0YSBiYXNlZCBvbiBzZWN0aW9uIHJlZmVyZW5jZVxuICAgKlxuICAgKiBAZnVuY3Rpb24gd3JpdGVTZWN0aW9uVGVtcGxhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNlYXJjaCAtIGtleSBvbiB3aGljaCB0byBtYXRjaCBzZWN0aW9uXG4gICAqIEBwYXJhbSB7ZmllbGR9IHN0cmluZyAtIGZpZWxkIGluIHdoaWNoIHRvIGxvb2sgdG8gZGV0ZXJtaW5lIHNlY3Rpb25cbiAgICogQHBhcmFtIHtvYmp9IHN0b3JlIC0gc2VjdGlvbnMgbWVtb3J5IHN0b3JlXG4gICAqL1xuICBnZXRTZWN0aW9uKHNlYXJjaCwgZmllbGQsIHN0b3JlKSB7XG4gICAgY29uc3Qgc2VjdGlvblZhbHVlcyA9IHN0b3JlXG4gICAgICAuZ2V0SW4oWydzZWN0aW9ucycsICdzZWN0aW9uc0J5UGF0aCddKVxuICAgICAgLnZhbHVlU2VxKCk7XG4gICAgbGV0IHNlbGVjdGVkU2VjdGlvbiA9IGZhbHNlO1xuXG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICBzZWxlY3RlZFNlY3Rpb24gPSBzZWN0aW9uVmFsdWVzXG4gICAgICAgIC5maWx0ZXIoKHZhbHVlKSA9PiB2YWx1ZVtmaWVsZF0gPT09IHNlYXJjaClcbiAgICAgICAgLmdldCgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRTZWN0aW9uID0gc3RvcmUuZ2V0SW4oWydzZWN0aW9ucycsICdzZWN0aW9uc0J5UGF0aCcsIHNlYXJjaF0pO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxlY3RlZFNlY3Rpb247XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZpbmQgd2hpY2ggY29uZmlndXJlZCBLU1MgZGlyZWN0b3J5IGEgZmlsZXBhdGggZXhpc3RzIGluXG4gICAqXG4gICAqIEBmdW5jdGlvbiBtYXRjaEtzc0RpclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZXBhdGggLSBmaWxlcGF0aCB0byBzZWFyY2ggZm9yXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBodXJvbiAtIGh1cm9uIGNvbmZpZ3VyYXRpb25cbiAgICogQHJldHVybiB7c3RyaW5nfSBrc3NNYXRjaCAtIHJlbGF0aXZlIHBhdGggdG8gS1NTIGRpcmVjdG9yeVxuICAgKi9cbiAgbWF0Y2hLc3NEaXIoZmlsZXBhdGgsIGh1cm9uKSB7XG4gICAgY29uc3Qga3NzU291cmNlID0gaHVyb24uZ2V0KCdrc3MnKTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBzcGFjZS11bmFyeS1vcHMgKi9cbiAgICAvLyBJbmNsdWRlIGZvcndhcmQgc2xhc2ggaW4gb3VyIHRlc3QgdG8gbWFrZSBzdXJlIHdlJ3JlIG1hdGNoaW4gYSBkaXJlY3RvcnksIG5vdCBhIGZpbGUgZXh0ZW5zaW9uXG4gICAgY29uc3Qga3NzTWF0Y2ggPSBrc3NTb3VyY2UuZmlsdGVyKChkaXIpID0+ICEgZmlsZXBhdGguaW5jbHVkZXMoYCR7ZGlyfS9gKSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBzcGFjZS11bmFyeS1vcHMgKi9cblxuICAgIGlmIChrc3NNYXRjaC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBrc3NNYXRjaFswXTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgY2hhbGsucmVkKGBmaWxlcGF0aCAke2ZpbGVwYXRofSBkb2VzIG5vdCBleGlzdCBpbiBhbnlcbiAgICAgIG9mIHRoZSBjb25maWd1cmVkIEtTUyBkaXJlY3Rvcmllc2ApXG4gICAgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHNyYy9jbGkvdXRpbHMuanMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSUE7QUFDQTtBQUNBO0FBR0E7QUFDQTtBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FBT0E7QUFDQTtBQUdBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUFRQTtBQUNBO0FBQUE7QUFDQTs7QUFEQTtBQUtBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBO0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFJQTtBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUFRQTtBQUNBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBR0E7QUFDQTtBQXZUQSIsInNvdXJjZVJvb3QiOiIifQ==");

/***/ })

};