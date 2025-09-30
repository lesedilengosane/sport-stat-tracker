## How to Contribute

### Setting things up locally

* First start a new folder on Your machine and clone this repository with the command:
```bash
git clone <repo-url>
```
* Navigate to the project and then open it in VScode
* Install all project dependencies by running the command.
  (NB:You need to make sure all dependencies are properly installed otherwise it will crash)
```bash
npm run install
```
### Getting things started with the app or main branch
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see all updates and current state of the product or app.

### Working on a feature or fixing a bug

* Create a new branch that You will be working on
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

* To test Your feature's behaviour do follow the above instructions under [Getting things started with the app or main branch](https://github.com/Cipher-Pol-Aigis-Zero/sport-stat-tracker/edit/Dev/README.md#working-on-a-feature-or-fixing-a-bug)

* To commit the code written You can then follow this sequence of git commands:
```bash
git add .
git commit -m <commit message>
git push
```
* Navigate to the repo on github then make a Pull-Request for Your branch
* Upon receiving appropriate approval Your features will be merged into the main branch where it will be automatically get deployed into the production enviroment
* Visit the production app by clicking [here](https://sport-stat-tracker-syg3.vercel.app
)



## Project rules and conventions

### Must know beforehand:
* We are working on 2 main branches,namely `Dev` and `minidev`
* `Dev` is the production enviroment while `minidev` is the preview enviroment that is tested thoroughly before deployment
* `Dev` ruleset is that it gets updated by `minidev` after 2 reviews and major changes have been incorporated,this will be done twice a week atmost
* `minidev` ruleset is that You need atleast 1 approval from any memeber to merge Your feature in
* You will always pull fromm`minidev` and then branch out,that is create Your working branch according to the convention to be spevified below
* You will then merge changes to this `minidev` upon an approval
* Make sure Your PR message is as descriptive as possible we do not want to decode some encryptic language that you speak with your maidee here.

### Adding a branch
* Branch names should follow a clear format depending on the type of work being done.  
Use **lowercase letters** with **hyphens (`-`)** to separate words.
### Format
type/scope-description


- **type** → what you are doing (`style`, `build`, `fix`, `integration`)  
- **scope** → the component, file, or area of the codebase  
- **description** → short and clear description of the change  

---

### Examples

#### 1. Styling
`style/navbar-colors`
`style/login-form-spacing`

#### 2. Building a Component
`build/signup-form`
`build/dashboard-widget`


#### 3. Fixing a Bug


`fix/navbar-overlap`
`fix/order-list-pagination`


#### 4. Integrating with Another File/Component
`integration/auth-api`
`integration/payment-service`


---

### Variables 

## Project structure 
## Project stack
