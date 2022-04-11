---
title: Turbocharge your monorepo with Lerna and Github Actions
date: 2022/04/02
description: A Guide to add Turborepo to Lerna monorepo
tag: monorepo, lerna, turborepo, web development
author: You
---

# Turbocharge your monorepo with Lerna and Github Actions

## Problem

At [Scalable Capital](https://de.scalable.capital/en) we use a Whitelabel platform which is a common place for reusable react components, configs, helpers, etc...

The platform is organised in a `monorepo` to manage it's packages. We're using [Lerna](https://lerna.js.org/) to handle the packages and their dependencies.

Now [Lerna](https://lerna.js.org/) does not uses any cache system. Every time you build or run tests on root level, it will run everything for all packages even if you changed a file in one of the packages.

This is bad because building and testing takes time and can take up lot of development time.

What if somehow we build and run tests only for the package that is changed and not all packages?

What if we can cache the Github action workflows for the Pull requests subsequent commits for PR checks?

Enter [Turborepo](https://turborepo.org/). ⚡️


---

## Changes

Let's get right into changes.


### Part 1 - Add Turborepo (assuming `Lerna` is already setup)

To add turbo, run the following command in your terminal

```
yarn add turbo --dev -W
```

Create a turbo.json file in the root of your project.

```
{
    "$schema": "https://turborepo.org/schema.json",
    "pipeline": {
        "build": {
            "dependsOn": ["^build"],
            "outputs": [".next/**"]
        },
        "test": {
            "outputs": []
        },
        "test-coverage": {
            "outputs": ["coverage/**"]
        },
        "start": {
            "cache": false
        },
        "typecheck": {
            "outputs": []
        },
        "prepublishOnly": {
            "outputs": []
        },
        "@scacap/whitelabel-app-cockpit#prepublishOnly": {
            "dependsOn": ["@scacap/whitelabel-components#prepublishOnly"]
        },
        "@scacap/whitelabel-app-onboarding#prepublishOnly": {
            "dependsOn": ["@scacap/whitelabel-components#prepublishOnly"]
        }
    }
}
```
In the above `turbo.json` file you need to define `pipeline`.
So everything which you want to run in NPM scripts of root `package.json` using `turbo run <tests | build>`, same field should be present in `pipeline`. 

`turbo` applies the pipeline task to the NPM scripts during execution.

Most important thing to note here is `dependsOn`. In above config `@scacap/whitelabel-app-cockpit` package `prepublishOnly` NPM script will run only when `@scacap/whitelabel-components`'s `prepublishOnly` script has been run.

More info on setting up pipeline is [here](https://turborepo.org/docs/reference/configuration#pipeline)

Finally changes to root `package.json`

![NPM Scripts diff](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6jsl03230fiu5866m67d.png)

Add `packageManager` to `package.json` if you are using `Yarn Workspaces` with `Lerna`

```
"packageManager": "yarn@1.22.17",
```


---

### Part 2 - Setting up Github actions with `turbo cache`

We use Github actions PR checks to maintain the quality of code.

The problem is every commit to a PR will trigger these checks (running tests, type checks etc..) and without some caching mechanism these tasks will run for all packages. 

Let's add Turbo magic to Github actions to speed up the the action workflow.

Let's take example of running tests.
If we change some tests for a package, without Turbo Cache `Lerna` will run tests  for all packages. And this happens for every commit. 😱

Let's change that

```
tests:
        name: Unit tests
        runs-on: ubuntu-18.04
        steps:
            - name: Checkout repo
              uses: actions/checkout@v2
              with:
                  fetch-depth: 0
            - name: Setup node
              uses: actions/setup-node@v2.1.5
              with:
                  node-version: 14
            - name: Restore node_modules cache
              uses: actions/cache@v2.1.5
              with:
                  path: '**/node_modules'
                  key: ${{ runner.os }}-modules-${{ hashFiles('**/yarn.lock') }}
            - name: Turbo Cache
              id: turbo-cache
              uses: actions/cache@v2
              with:
                  path: .turbo
                  key: turbo-${{ github.job }}-${{ github.ref_name }}-${{ github.sha }}
                  restore-keys: |
                      turbo-${{ github.job }}-${{ github.ref_name }}-
            - name: Install packages
              run: yarn --frozen-lockfile
            - name: All tests
              run: yarn test-coverage --cache-dir=".turbo"
            - name: Add coverage comment
              continue-on-error: true
              uses: eeshdarthvader/code-coverage-assistant@master
              with:
                  github-token: ${{ secrets.GITHUB_TOKEN }}
                  monorepo-base-path: './packages'
```


Here we are adding mem cache in Github action workflow and store our cache data in `.turbo` which will be reused between commits in the same PR.


---
# Results

 
**Normal CI PR checks on each commit looks like this.**

 ℹ️ _Note the time. This much time is taken for every tiny commit you push to PR._
  
<img width="835" alt="Screenshot 2022-03-10 at 20 10 40" src="https://user-images.githubusercontent.com/16473868/157738954-757febed-8690-4c29-b74d-4fd5f6b7fa27.png" />



 **CI runs with TurboRepo**

<img width="832" alt="Screenshot 2022-03-10 at 20 11 00" src="https://user-images.githubusercontent.com/16473868/157739150-d5f5c337-9e8e-4dce-a336-e18c0aee1774.png" />

> ℹ️  The test run has decreased from `4 min` to `1 min` and Typecheck reduced from `3 min` to `52 sec 😱`


Let's see how it helps when you are developing locally.

After first run of tests using `yarn test`, try running it again.

<img width="613" alt="Screenshot 2022-03-10 at 20 26 24" src="https://user-images.githubusercontent.com/16473868/157739587-4d6d3d36-c3cb-4ed6-9c08-547c06c173a2.png" />

✅ **==> FULL TURBO** ✅


> The tests which usually takes `~20 sec` to run everytime, with Turborepo it ran for freaking `0.7 sec` with its caching system. 🎉

That's all folks! Hope you all Turbocharge your monorepo's with [Turborepo](https://turborepo.org/)
 
<u>More resources</u>
1. Official guide [Migrate from Lerna](https://turborepo.org/docs/guides/migrate-from-lerna) 
2. [Pull request Github Action workflow](https://gist.github.com/eeshdarthvader/8513e7fe308fbab089fa6603b55bb8aa) mentioned in the Post
3. [Code coverage Github action](https://github.com/eeshdarthvader/code-coverage-assistant) built for Monorepo's 
