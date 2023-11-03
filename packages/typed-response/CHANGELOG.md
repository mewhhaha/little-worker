# @mewhhaha/typed-response

## 0.0.43

### Patch Changes

- 8d7ec77: Fix generation and change to using yargs

## 0.0.42

### Patch Changes

- cb3193b: Add pure marker to route export
- 98b0c93: Change commander to use esm

## 0.0.41

### Patch Changes

- f637da7: Add init package and move PATTERN code to little-worker

## 0.0.40

### Patch Changes

- ad9d1c5: Move extra packages to submodules

## 0.0.39

### Patch Changes

- 41a89cf: Make route generation only be one file and simplify types in little-router

## 0.0.38

### Patch Changes

- 7529f49: Add little-worker package

## 0.0.37

### Patch Changes

- 197b177: Be more specific about ok 204 and 205 responses

## 0.0.36

### Patch Changes

- e7fe317: Update typed response functions

## 0.0.35

### Patch Changes

- 1590114: Fix route function with plugins

## 0.0.34

### Patch Changes

- dff371c: Update route to accept third party altered environment arguments

## 0.0.33

### Patch Changes

- d8e5061: Update normal json type on text to be never

## 0.0.32

### Patch Changes

- 73a68f0: Update TextResponse type

## 0.0.31

### Patch Changes

- a426e49: Expose FetcherOf type

## 0.0.30

### Patch Changes

- 55ca387: Loose up JSONString type

## 0.0.29

### Patch Changes

- 8e01c83: Improve error messages for validation and export RouteArguments type

## 0.0.28

### Patch Changes

- d841c8f: Fix collision in fetcher when validating path

## 0.0.27

### Patch Changes

- 23567fa: Fix autocomplete for query strings with generic types

## 0.0.26

### Patch Changes

- 0314028: Update error messages for plugins

## 0.0.25

### Patch Changes

- e761e04: Fix consecutive params in fetcher

## 0.0.24

### Patch Changes

- fa23121: Update error messages for data and query

## 0.0.23

### Patch Changes

- 3517a71: Easier way of creating fetcher with fetch

## 0.0.22

### Patch Changes

- 09ca483: change \_types to infer
- 9e55fb1: Improve perfomance for non-plugin routes
- f1b7765: Improve performance by avoid using proxy

## 0.0.21

### Patch Changes

- f48247d: Fix JSONString value type
- 70c3613: Add empty helper response

## 0.0.20

### Patch Changes

- f713ee7: Fix replacer function in JSON.stringify
- 139dadf: Add helper JSONStringify function

## 0.0.19

### Patch Changes

- 8946dfd: Improve fetcher autocomplete greatly
- d9d6038: Remove invalid methods from fetcher

## 0.0.18

### Patch Changes

- 768fb45: Experimental exposed type

## 0.0.17

### Patch Changes

- 6360a40: Fix JSON string serialization

## 0.0.16

### Patch Changes

- 331784b: Serialize in json-string

## 0.0.15

### Patch Changes

- 1bd7af1: Go back to just ok code

## 0.0.14

### Patch Changes

- 9baf7eb: Fix nonsensical restriction of out value

## 0.0.13

### Patch Changes

- 206e794: Fix issue with input paramters still not accepting functions

## 0.0.12

### Patch Changes

- 8cd0dad: Fix query in out arktype parameters

## 0.0.11

### Patch Changes

- 1c5516b: Fix arktype inference of outgoing data
- 97ad605: Fix all not causing type errors for overlapping routes

## 0.0.10

### Patch Changes

- c5f3668: Add options route

## 0.0.9

### Patch Changes

- 14a0950: Fix types for plugin rest parameters

## 0.0.8

### Patch Changes

- bdfbac5: Add `success` helper and hardcode `ok` to be 200
- 097ef83: Fix typescript not complaining about missing beginning slash

## 0.0.7

### Patch Changes

- 490444b: Fix little-fetcher not working with param and and ending with wildcard

## 0.0.6

### Patch Changes

- 9f88b4b: Fix wildcards not working for little-fetcher

## 0.0.5

### Patch Changes

- e7ad13e: Update README for plugins

## 0.0.4

### Patch Changes

- fdeca5a: Fix null being always returned from ok and error

## 0.0.3

### Patch Changes

- b08e85d: Update typed response to also be aligned with cloudflare Response

## 0.0.2

### Patch Changes

- c7e81c2: Move typed-response dependency
