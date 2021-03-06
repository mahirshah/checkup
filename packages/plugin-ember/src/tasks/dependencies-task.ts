import { Task, TaskResult, getPackageJson } from '@checkup/core';

import { DependenciesTaskResult } from '../results';
import { PackageJson } from 'type-fest';

function getDependency(dependencies: PackageJson.Dependency | undefined, key: string): string {
  if (typeof dependencies === 'undefined') {
    return '';
  }

  return dependencies[key];
}

function getDependencies(
  dependencies: PackageJson.Dependency | undefined,
  filter: (dependency: string) => boolean
) {
  if (typeof dependencies === 'undefined') {
    return {};
  }

  return Object.entries(dependencies).reduce((orig: Record<string, string>, pair) => {
    let [key, value] = pair;

    if (filter(key)) {
      orig[key] = value;
    }

    return orig;
  }, {});
}

function emberAddonFilter(dependency: string) {
  return dependency.startsWith('ember-') && !dependency.startsWith('ember-cli');
}

function emberCliAddonFilter(dependency: string) {
  return dependency.startsWith('ember-cli');
}

export default class DependenciesTask implements Task {
  async run(): Promise<TaskResult> {
    let result: DependenciesTaskResult = new DependenciesTaskResult();
    let pkg: PackageJson = getPackageJson();

    result.emberLibraries['ember-source'] = getDependency(pkg.devDependencies, 'ember-source');
    result.emberLibraries['ember-cli'] = getDependency(pkg.devDependencies, 'ember-cli');
    result.emberLibraries['ember-data'] = getDependency(pkg.devDependencies, 'ember-data');
    result.emberAddons = {
      dependencies: getDependencies(pkg.dependencies, emberAddonFilter),
      devDependencies: getDependencies(pkg.devDependencies, emberAddonFilter),
    };

    result.emberCliAddons = {
      dependencies: getDependencies(pkg.dependencies, emberCliAddonFilter),
      devDependencies: getDependencies(pkg.devDependencies, emberCliAddonFilter),
    };

    return result;
  }
}
