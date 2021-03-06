import {
  DOM_SELECTOR,
  COMPONENT_SELECTOR,
  FUNCTIONAL_OPTIONS
} from 'shared/consts'

export function vmMatchesName (vm, name) {
  return !!name && (
    (vm.name === name) ||
    (vm.$options && vm.$options.name === name)
  )
}

function vmCtorMatches (vm, component) {
  if (
    vm.$options && vm.$options.$_vueTestUtils_original === component ||
    vm.$_vueTestUtils_original === component
  ) {
    return true
  }

  const Ctor = typeof component === 'function'
    ? component.options._Ctor
    : component._Ctor

  if (!Ctor) {
    return false
  }

  if (vm.constructor.extendOptions === component) {
    return true
  }

  if (component.functional) {
    return Object.keys(vm._Ctor || {}).some(c => {
      return component === vm._Ctor[c].extendOptions
    })
  }
}

export function matches (node, selector) {
  if (selector.type === DOM_SELECTOR) {
    const element = node instanceof Element
      ? node
      : node.elm
    return element && element.matches && element.matches(selector.value)
  }

  const isFunctionalSelector = typeof selector.value === 'function'
    ? selector.value.options.functional
    : selector.value.functional

  const componentInstance = isFunctionalSelector
    ? node[FUNCTIONAL_OPTIONS]
    : node.child

  if (!componentInstance) {
    return false
  }

  if (selector.type === COMPONENT_SELECTOR) {
    if (vmCtorMatches(componentInstance, selector.value)) {
      return true
    }
  }

  // Fallback to name selector for COMPONENT_SELECTOR for Vue < 2.1
  const nameSelector =
  typeof selector.value === 'function'
    ? selector.value.extendOptions.name
    : selector.value.name
  return vmMatchesName(componentInstance, nameSelector)
}
