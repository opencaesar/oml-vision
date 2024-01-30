# How to contribute

We thank you for taking time to contribute! We appreciate your help with feature implementation, bug fixes, unit tests, or just for reporting the issues and improvement ideas.

- Developer instructions are available in the [DEVELOPMENT.md](DEVELOPMENT.md)
- Project's main issue tracker is [here](https://github.com/opencaesar/oml-vision/issues/new/choose) and this is the prefered place to post issues. 
- Free free to contact the maintainers of the project [here](https://www.opencaesar.io/contributors/)

## Environment details

Details on how to build and set up the project are available in the [DEVELOPMENT.md](DEVELOPMENT.md).

## API Documentation

API documentation is available in the [OML Vision Docs](http://www.opencaesar.io/oml-vision-docs/).  

**New features and bug fixes must be added to this documentation before new code is merged.**

## Testing

We use [Jest](https://jestjs.io/) for unit testing. We would always be happy to increase unit test coverage. Please write unit tests for new code that you create.

## Reporting bugs

You may report bugs to the issue tracker [here](https://github.com/opencaesar/oml-vision/issues/new/choose). 

## Suggesting features

You may post feature/enhancement requests on the project's issue tracker [here](https://github.com/opencaesar/oml-vision/issues/new/choose).

## Coding conventions

We suggest using Google's TypeScript coding conventions found [here](https://google.github.io/styleguide/tsguide.html).

## Submitting changes

Please create a pull request to our project's Github repo. As a merge request description, please fill in the pull request description template [here](https://github.com/opencaesar/oml-vision/pulls). We would be very grateful if you would include Jest unit tests for the added code.

Make sure that all of your commits are atomic (i.e. addressing not more than one feature per commit) and always write a clear message for your commits.

For branch names, use convention `fix/ISSUE_NUMBER-<FIX_SUMMARY>` for bug fixes and `feat/ISSUE_NUMBER-<FEAT_SUMMARY>` for feature implementations.

### Developer certificate of origin

Contributions to this repository are subject to the [Developer Certificate of Origin](DCO). All commits should be signed off by either using `-s` or `--signed` flag while committing:
```
git commit -s -m "My commit message"
```

Alternatively, you can add additional line to the commit message:

```
My commit message

Signed-off-by: Dev McDeveloper <Dev.McDeveloper@example.com>
```
