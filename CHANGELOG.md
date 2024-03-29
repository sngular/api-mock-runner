## [1.0.1](https://github.com/sngular/api-mock-runner/compare/v1.0.0...v1.0.1) (2024-02-02)


### Bug Fixes

* handle errors reading config ([2e27d0b](https://github.com/sngular/api-mock-runner/commit/2e27d0b0368c590e4b9f4062937e958241e90800))

# 1.0.0 (2024-01-15)


### Bug Fixes

* check for empty schemaPaths flag ([f73dc29](https://github.com/sngular/api-mock-runner/commit/f73dc29d162cf487adb6c3fd8606fdc71a92f536))
* **clone-git-repository:** add missing param and remove await ([4695e60](https://github.com/sngular/api-mock-runner/commit/4695e6043105c42486d048f3b3f387d0382484a9)), closes [#18](https://github.com/sngular/api-mock-runner/issues/18)
* **clone-repo:** remove waitUserInput function ([65bbe76](https://github.com/sngular/api-mock-runner/commit/65bbe767f96e6c25d1c8d9f3233cf6df9c9ced9f))
* improve user messages ([6d4b0b9](https://github.com/sngular/api-mock-runner/commit/6d4b0b9a829c9c465da54187c2528efe075fe440))
* path to save .apimockrc file ([d859692](https://github.com/sngular/api-mock-runner/commit/d859692a1656400c41581f5b5b1b7c318a49f1b7))
* skipping if has a no OAS file ([a6c3456](https://github.com/sngular/api-mock-runner/commit/a6c3456306928fe13f892d9cbff24c0d530bb684))
* solve build types errors ([bf3de52](https://github.com/sngular/api-mock-runner/commit/bf3de52d5e9d9dcd8a8662df7663608b66a19243))
* solve error on colours import ([4229a59](https://github.com/sngular/api-mock-runner/commit/4229a590d11ddc1076774a231a8690c34d734ebd))
* solve error with absolute paths ([80b83ce](https://github.com/sngular/api-mock-runner/commit/80b83cec516096d05339ecdaecaab68ac1ce8e46)), closes [#30](https://github.com/sngular/api-mock-runner/issues/30)
* unhandled promise ([47920ee](https://github.com/sngular/api-mock-runner/commit/47920ee1730a8ea8ce056a3f1c1bb5de6aa70da7))
* use path join to compose paths ([b997f35](https://github.com/sngular/api-mock-runner/commit/b997f35415a504859c9228b0fa8566ed65440868))
* wait promise to negate ([b359576](https://github.com/sngular/api-mock-runner/commit/b3595769bb469e35b7d62ba465f7c726687ccdaf))


### Features

* **.gitignore:** add config file ([ef06c0d](https://github.com/sngular/api-mock-runner/commit/ef06c0de458e5c4de5e76779593992a927547932))
* 16-error-control ([5784fe0](https://github.com/sngular/api-mock-runner/commit/5784fe0adedb6bcc2f09bb5d02047f1771e71472))
* add basic cli functionality with inquirer ([341e61f](https://github.com/sngular/api-mock-runner/commit/341e61f7603d099fcd9e4ce32097470f5b113674))
* add commander ([c9377b5](https://github.com/sngular/api-mock-runner/commit/c9377b594eff63ba2b7ba4c8c5b067c0ea0a21e8))
* add commander ([d8f0247](https://github.com/sngular/api-mock-runner/commit/d8f0247030d61bdf555ce0e09d44208e374d5831))
* add example.js ([7ccf8dc](https://github.com/sngular/api-mock-runner/commit/7ccf8dc0f844fea6c3ee3b6459f3411a7ab34f04))
* add function to search ([24d9256](https://github.com/sngular/api-mock-runner/commit/24d92562c35812e4d00cae8bd0bd49f936f49f2e))
* add initial command tool options ([b6623b7](https://github.com/sngular/api-mock-runner/commit/b6623b7889998fef46a54293de4926067427241c))
* add inquirer checkbox validation ([aefbf3d](https://github.com/sngular/api-mock-runner/commit/aefbf3d455ca5c535e8458b4b2e2837b37027a5e)), closes [#31](https://github.com/sngular/api-mock-runner/issues/31)
* add logger ([25a12a3](https://github.com/sngular/api-mock-runner/commit/25a12a3c80602507907eecbcb425bdbcf4caf1ad))
* add ssh git clone functionality ([ee09f2d](https://github.com/sngular/api-mock-runner/commit/ee09f2d75ea1b78c015eedb6e72be14b1dad4b41))
* add to main ([43609fc](https://github.com/sngular/api-mock-runner/commit/43609fce30c9c91283fa7345a0d90d2f5012ebc5))
* add to utils ([2bf2841](https://github.com/sngular/api-mock-runner/commit/2bf284150be4d7e5b2d6c87133cfdbea578b7201))
* check if origin folder exists ([79e85a2](https://github.com/sngular/api-mock-runner/commit/79e85a255258e0e0abd9ff7fea87f84601241ab9))
* **cli:** add RC file validation ([766ea23](https://github.com/sngular/api-mock-runner/commit/766ea23e29cad5e6bf844afda0816d75ca06ba74)), closes [#5](https://github.com/sngular/api-mock-runner/issues/5) [#10](https://github.com/sngular/api-mock-runner/issues/10)
* **cli:** handle remote and local repositories ([0838fbc](https://github.com/sngular/api-mock-runner/commit/0838fbcadfe64df88ec70ed28ff782a2ab636a90)), closes [#5](https://github.com/sngular/api-mock-runner/issues/5) [#10](https://github.com/sngular/api-mock-runner/issues/10)
* **cli:** validate local or remote regex ([58bbb07](https://github.com/sngular/api-mock-runner/commit/58bbb073ff8d70d25aaeeb5a5d0848d68bc898eb)), closes [#5](https://github.com/sngular/api-mock-runner/issues/5) [#10](https://github.com/sngular/api-mock-runner/issues/10)
* control openapi schema not found ([bb8d4d7](https://github.com/sngular/api-mock-runner/commit/bb8d4d7fe2fd446aea64ddd74538eb4eee8d06f3)), closes [#16](https://github.com/sngular/api-mock-runner/issues/16) [#22](https://github.com/sngular/api-mock-runner/issues/22)
* **core:** add ability to select multiple schemas ([4e1f97f](https://github.com/sngular/api-mock-runner/commit/4e1f97f6a6b46cadad58671429eb0e8ea09d654e)), closes [#8](https://github.com/sngular/api-mock-runner/issues/8)
* **core:** add function to overwrite a file ([4fffffd](https://github.com/sngular/api-mock-runner/commit/4fffffd3d028a5dc5d51e04e45a5f650c9dee076))
* **core:** change user flow ([8ef890e](https://github.com/sngular/api-mock-runner/commit/8ef890eeaaba682bf24ff57e38ea81513a5fd744))
* find yamls from a dir ([367edbd](https://github.com/sngular/api-mock-runner/commit/367edbdca529fb608e03b13135563586b4a4d00c))
* init repo ([251b802](https://github.com/sngular/api-mock-runner/commit/251b8027e1c30d02e27823cf8a44b714d2666568))
* **inputs:** add origin and port validators ([3cdf5eb](https://github.com/sngular/api-mock-runner/commit/3cdf5eb8fd3ac46b82d790d668a51cc13bbfc702))
* **main:** connect input with clone repo function ([8590aa9](https://github.com/sngular/api-mock-runner/commit/8590aa9e19f13bcc53e26990b507868e3e7c2d95)), closes [#5](https://github.com/sngular/api-mock-runner/issues/5)
* prepare to MVP ([de370c7](https://github.com/sngular/api-mock-runner/commit/de370c703af6569ee4439abfdc768b78b2dc98af))
* read just the first line ([321db7e](https://github.com/sngular/api-mock-runner/commit/321db7e2183bf3dd93d90e65689cb319cbd22138))
* **services:** add function to search oas non recursively ([32244e0](https://github.com/sngular/api-mock-runner/commit/32244e02dd1ffc6187c5aa1747783110703f03a4)), closes [#20](https://github.com/sngular/api-mock-runner/issues/20)
* **services:** add multiple mock servers functionality ([92d55d5](https://github.com/sngular/api-mock-runner/commit/92d55d5056e7cdf3822ea7cf834c7576505acc44)), closes [#8](https://github.com/sngular/api-mock-runner/issues/8)
* try in index ([c80e6f8](https://github.com/sngular/api-mock-runner/commit/c80e6f844ad8f8517e52686711e3aa83009cd603))
* update addToGitignore functionality ([4389ce7](https://github.com/sngular/api-mock-runner/commit/4389ce7f0fb56f46c9f98c631b7ada90a9b65da0)), closes [#21](https://github.com/sngular/api-mock-runner/issues/21)
