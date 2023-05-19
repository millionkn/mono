export const getEnv = (():(name:string)=>string=>{
  if(process.platform === 'win32'){
    return (name)=>`%${name}%`
  }else{
    return (name)=>`"$${name}"`
  }
})()