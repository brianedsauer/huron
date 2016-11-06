// Accept the huron.js module for Huron development
if (module.hot) {
  module.hot.accept();
}

/* Method for inserting HTML snippets at particular insertion points
 *
 * Uses require() to grab html partials, then inserts that html
 * into an element with an attribute `huron-id` corresponding to the template filename.
 */
class InsertNodes {

  constructor(modules, store) {
    this._modules = modules;
    this._moduleIds = Object.keys(modules);
    this._config = null;
    this._sections = null;
    this._templates = null;
    this._prototypes = null;
    this._types = null;

    // Module meta
    this.meta = {};

    // Set store values
    this.store = store;

    // Inits
    this.cycleModules(document);
    this.cycleStyleguide();
  }

  /**
   * Replace all template markers with the actual template markup.
   *
   * @param  {object} context    The context (e.g. document) that you will query
   *                             for the template ID to replace
   * @param  {bool}   cached     Whether or not to use cached values for module replacement
   * @param  {object} filter     Filter for modules. Fields explained in the filterModules() function docs
   */
  cycleModules(context, cached = false, filter = false) {
    for (let module in this._modules) {
      this.loadModule(context, module, this._modules[module], cached, filter);
    }
  }

  /**
   * Reload styleguide sections and menu helpers
   */
  cycleStyleguide() {
    // Sections
    const sectionsQuery = document.querySelector('[huron-sections]');
    if (sectionsQuery) {
      sectionsQuery.innerHTML = '';
      this.outputSections(null, sectionsQuery);
      this.cycleSections();
    }

    // Menu
    const menuQuery = document.querySelector('[huron-menu]');
    if (menuQuery) {
      menuQuery.innerHTML = '';
      this.outputMenu(null, menuQuery);
    }
  }

  /**
   * Helper for reloading sections only
   */
  cycleSections() {
    this.cycleModules(document, false, {
      property: 'type',
      values: ['section'],
      include: true,
    });
  }

  /**
   * Replace all sections. For hot reloading use when the section template has changed.
   *
   * @param {object} context     The context (e.g. document) that you will query
   *                             for the template ID to replace
   * @param {string}  key        Module require path
   * @param {mixed}   module     Module contents
   * @param {bool}    chached    Whether or not to use cached values for module replacement
   * @param {object}  filter     Filter for modules. Fields explained in the filterModules() function docs
   */
  loadModule(context, key, module, cached = false, filter = false) {
    let moduleMeta = null;
    let shouldLoad = true;

    // Check if we should load from internal module metadata cache
    if (cached) {
      moduleMeta = this.meta[key];
    } else {
      moduleMeta = this.meta[key] = this.getMetaFromPath(key, module);
    }

    if (moduleMeta) {

      if (filter) {
        shouldLoad = this.filterModules(filter, moduleMeta);
      }

      if (shouldLoad) {
        this.replaceTemplate(context, moduleMeta);
      }
    }
  }

  /**
   * Replace all template markers with the actual template markup.
   *
   * @param {object} filter - Filter for modules. Options:
   * @param {string} filter.property - Which property to filter ('key' or 'type')
   * @param {array}  filter.values - Values for property
   * @param {bool}   filter.include - Whether the values should be included or excluded (true = include, false = exclude)
   * @param {object} moduleMeta  Filter for modules. Fields explained in the filterModules() function docs
   */
  filterModules(filter, moduleMeta) {
    const moduleKeys = Object.keys(this._modules);

    // Check if we should filter out any modules
    if (
      'object' === typeof filter &&
      filter.hasOwnProperty('property') &&
      filter.hasOwnProperty('values') &&
      filter.hasOwnProperty('include')
    ) {
      const match = filter.values.filter((value) => moduleMeta[filter.property] === value);
      return Boolean(match.length) === filter.include;
    }

    console.log(`
      filter ${filter} is not in a valid format.
      module filters must include 'property', 'values', and 'include' properties
    `);

    return true;
  }

  /**
   * Replace a single template marker with template content.
   *
   * @param {object} context - The context (e.g. document) that you will query
   *                          for the template ID to replace
   * @param {object} meta - Module metadata
   */
  replaceTemplate(context, meta) {
    let tags = null;

    meta.type = this.validateType(meta.type);
    tags = context.querySelectorAll(`[data-huron-id="${meta.id}"][data-huron-type="${meta.type}"]`);

    if (tags && meta.render) {
      for (let i = 0; i < tags.length; i++) {
        const currentTag = tags.item(i);
        const parentTag = currentTag.parentNode;
        const modifier = currentTag.dataset.huronModifier;
        // const isReplaced = currentTag.dataset.huronReplaced;
        let rendered = null;

        if (meta.data) {
          // If we have a modifier, use it, otherwise use the entire data set
          if (modifier && meta.data[modifier]) {
            rendered = meta.render(meta.data[modifier]);
          } else {
            rendered = meta.render(meta.data);
          }
        } else {
          rendered = meta.render();
        }

        currentTag.innerHTML = this.convertToElement(rendered)
          .querySelector('template')
          .innerHTML;

        const results = [...currentTag.childNodes];

        const resultElements = results.filter((result) => {
          return result instanceof HTMLElement;
        });

        if (resultElements.length > 1) {
          console.warn(
            `Module needs to be wrapped in single tag.
            section: ${meta.id}
            type: ${meta.type}`
          );
        }

        results.some((result) => {

          console.log(results, result);

          if (result instanceof HTMLElement) {

            // Put the attributes back on this div.
            result.setAttribute('data-huron-id', meta.id);
            result.setAttribute('data-huron-type', meta.type);
            // result.setAttribute('data-huron-replaced', 'true');

            if (modifier) {
              result.setAttribute('data-huron-modifier', modifier);
            }

            parentTag.insertBefore(result, currentTag);

            // Recursively load modules, excluding the current one
            this.cycleModules(currentTag, true, {
              property: 'key',
              values: [meta.key, this._sectionTemplatePath],
              include: false,
            });
          }

          return result instanceof HTMLElement;
        });

        parentTag.removeChild(currentTag);
      }
    } else {
      console.warn(
        `Could not render module
        section: ${meta.id}
        type: ${meta.type}`
      );
    }
  }

  /**
   * Get module metadata from a module require path
   *
   * @param  {string} key - Module require path
   *
   * @return {object} - id: huron id (referenceURI)
   *                    type: huron type
   *                    key: module require path (key)
   *                    module: module contents
   */
  getMetaFromPath(key, module) {
    const sections = this._sections.sectionsByPath;
    const templateTypes = this._types.filter((type) => type !== 'prototype');
    let id = false;
    let type = false;

    if (key.indexOf(`./prototypes`) !== -1) {
      const prototype = Object.keys(this._prototypes)
        .filter((name) => this._prototypes[name] === key);

      if (prototype.length) {
        id = prototype;
        type = 'prototype';
      }
    } else if (key === this._sectionTemplatePath) {
      id = 'sections-template',
      type = 'sections-template';
    } else {
      for (let section in sections) {
        const testTypes = templateTypes.filter((type) => sections[section][`${type}Path`] === key);

        if (testTypes.length) {
          id = sections[section].referenceURI;
          type = testTypes[0];
          break;
        }
      }
    }

    if (id && type) {
      const renderData = this.getModuleRender(type, key, module);

      if (renderData) {
        return Object.assign({id, type, key, module}, renderData);
      }
    }

    console.warn(`Could not find module '${key}' or module cannot be hot reloaded`);
    return false;
  }

  /**
   * Transform every module into a predictable object
   *
   * @param  {object} type    Module metadata
   * @param  {mixed}  module  Module contents
   *
   * @return {object} render: render function
   *                  data: original module contents
   *                  id: id of partial
   */
  getModuleRender(type, key, module) {
    let render = false;
    let data = false;

    if ('template' === type && 'function' === typeof module) {
      // It's a render function for a template
      render = module;
      data = this._modules[this._templates[key]];
    } else if (
      'sections-template' === type &&
      'function' === typeof module
    ) {
      // It's a kss section template
      render = module;
    } else if (
      'section' === type &&
      'object' === typeof module
    ) {
      // It's section data
      render = this._modules[this._sectionTemplatePath];
      data = module;
    } else if (
      ('template' === type || 'description' === type || 'prototype' === type) &&
      'string' === typeof module
    ) {
      // it's straight HTML
      render = () => module;
    } else if ('data' === type && 'object' === typeof module) {
      // It's a data file (.json)
      render = this._modules[this._templates[key]];
      data = module;
    }

    // Only need render, as data will be left empty for static HTML
    if (render) {
      return {render, data};
    }

    return false;
  }

  /**
   * Verify specified element is using an acceptable huron type
   *
   * @param  {string} type - type of partial
   *                         (template, data, description, section or prototype )
   *
   * @return {string} - huron type or 'template' if invalid
   */
  validateType(type) {
    if ('data' === type) {
      return 'template';
    }

    if (!this._types.includes(type)) {
      return false;
    }

    return type;
  }

  /**
   * Get markup from any type of module (html, json or template)
   *
   * @param {string} content String corresponding to markup
   */
  convertToElement(content) {
    let el = document.createElement('div');
    el.innerHTML = content;
    return el.firstElementChild;
  }

  /*
   * Check if a template contains a specific subtemplate.
   */
  hasTemplate(template, templateId) {
    if (templateId !== null) {
      const subTemplate = template
        .querySelector('template')
        .content
        .querySelector(`[data-huron-id=${templateId}`);

      if (subTemplate !== null) {
        return true;
      }
    }

    return false;
  }

  /* Helper function for inserting styleguide sections.
   *
   * Recurses over sorted styleguide sections and inserts a <section> tag with
   * [huron-id] equal to the section template name.
   */
  outputSections(parent, el, sections = this._sections.sorted) {
    let templateId = null;
    let wrapper = null;

    for (let section in sections) {
      if (parent) {
        templateId = `${parent}-${section}`;
      } else {
        templateId = section;
      }

      if (el) {
        wrapper = document.createElement('div');
        wrapper.dataset.huronId = templateId;
        wrapper.dataset.huronType = 'section';
        el.appendChild(wrapper);
      }

      if (Object.keys(sections[section]).length && wrapper) {
        this.outputSections(
          templateId,
          wrapper,
          sections[section]
        );
      }
    }
  }

  /* Helper function for inserting styleguide sections.
   *
   * Recurses over sorted styleguide sections and inserts a <ul> to be used as a menu for each section
   */
  outputMenu(parent, el, sections = this._sections.sorted) {
    let templateId = null;
    let wrapper = null;

    for (let section in sections) {
      if (parent) {
        templateId = `${parent}-${section}`;
      } else {
        templateId = section;
      }

      if (el) {
        const title = this._sections
            .sectionsByURI[templateId] ?
          this._sections
            .sectionsByURI[templateId]
            .referenceURI :
          templateId;
        const link = `<a href="#${templateId}">${title}</a>`;
        const submenu = el.querySelector('ul');

        if (Object.keys(sections[section]).length) {
          wrapper = document.createElement('ul');
          wrapper.classList.add('sections-menu');
          wrapper.innerHTML = `<li class="menu-item">
            ${link}
            <ul></ul>
          </li>`;
        } else {
          wrapper = document.createElement('li');
          wrapper.innerHTML = link;
        }

        if (submenu) {
          submenu.appendChild(wrapper);
        } else {
          el.appendChild(wrapper);
        }
      }

      if (sections[section] && wrapper) {
        this.outputMenu(
          templateId,
          wrapper,
          sections[section]
        );
      }
    }
  }

  /*
   * Set new modules object
   */
  set modules(modules) {
    this._modules = modules;
    this._moduleIds = Object.keys(modules);
  }

  /*
   * Set store
   */
  set store(store) {
    this._store = store;
    this._config = store.config;
    this._sections = store.sections;
    this._templates = store.templates;
    this._prototypes = store.prototypes;
    this._types = store.types;
    this._sectionTemplatePath = store.sectionTemplatePath
  }
}

// Create a new instance of the InsertNodes class
/*eslint-disable*/
// Create object for modifiying the templates on the page and
// initial first templates.
const insert = new InsertNodes(modules, store);
/*eslint-enable*/
