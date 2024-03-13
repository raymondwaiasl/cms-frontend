# README

## Before Beginning

Prerequisite: Node JS v16 or above, npm, yarn(optional)

```bash
//recommended
yarn
//if no yarn installed
npm install
```

### Start the project

```bash
yarn start:all

npm run start:all
```

### Create new common UI

```bash
yarn nx g @nrwl/react:lib my-new-lib --project={projectname} //eg common/admin/user


```

## Hooks

There are several major custom hooks being used for component system to works

### useDialog (Subjected to change)

```js
const
{
data:T,
openDialog(key:string,data:any),
closeDialog(key:string),
closeCurrentDialog(),
dialogs:Array<{key:string,data:any}>
}=useDialog<T>(key?:string)
```

If the component want to receive new data changes from other components, key string **must** be given to useDialog without any duplication, otherwise component may not received any new data changes

#### openDialog

```js
openDialog(key:string,data:any)

//eg open delete Dialog
openDialog('deleteDialog',{
title:'Never Gonna',
message:'Give you up'
confirmAction:()=>console.log('Say goodbye')
})

//DeleteDialog.tsx
const DeleteDialog=()=>{
const {data,isOpen,closeCurrentDialog}=useDialog('deleteDialog')
return(
<Dialog isOpen={isOpen}>
<Dialog.Title>
{data?.title} //"Never Gonna"
</Dialog.title>
<Dialog.Content>
{data?.message}//"Give You Up"
</Dialog.Content>
<Dialog.Action>
<button onClick={()=>data?.confrimAction&&data?.confirmAction()}> //Say goodbye
Delete
</button>
<button onClick={()=>{
data?.confrimAction&&data?.confirmAction()
closeCurrentDialog()
}}>
Cancel
</button>
</Dialog.Action>
</Dialog>
)
}
```

If you want to open a new Dialog from a particular component, you could call it open with key specified in the first argument, with optional data supplied. We don’t have any opinions on how you construct data type, however you are recommended to put all your data into a single object.

### closeCurrentDialog

```js
//DeleteDialog
//DeleteDialog.tsx
const DeleteDialog=()=>{
const {data,isOpen}=useDialog('deleteDialog')
return(
<Dialog isOpen={isOpen}>
<Dialog.Title>
{data?.title}
</Dialog.title>
<Dialog.Content>
{data?.message}
</Dialog.Content>
<Dialog.Action>
<button onClick={()=>{
data?.confrimAction&&data?.confirmAction()
closeCurrentDialog() //Modal close
}}>
Delete
</button>
<button onClick={()=>{
data?.confrimAction&&data?.confirmAction()
closeCurrentDialog() //Modal close
}}>
Cancel
</button>
</Dialog.Action>
</Dialog>
)
}
```

closeCurrentDialog, closing current dialog action and remove dialog content from current open dialog queue but require isOpen as another parameter to work with

### useWidget (Subjected to Change)

```js
const
{
data:T,
openWidget(key:string,data:any),
closeDialog(key:string),
closeCurrentDialog(),
widgets:Array<{key:string,data:any,id:string||nanoid}>
//data in widgets array are subjected to be deprecated, but you still can get access ro widget data via recoil store
}=useWIdget<T>(key?:string)

```

Widgets are components that behave similar to dialog which use recoil as global store to ensure the performance

## Rule

To ensure the project style, This project utilize `prettier` and `eslint` to ensure the coding style unified

To run code formatter, please run `npm run fix`. We also employ `husky` as commit hook to check and format coding style. Please make sure you don't bypass husky hook if no error was found

## Last word

ENJOY CODING
