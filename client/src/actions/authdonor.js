import axios from 'axios'
import { setAlert } from './alert';
import { REGISTER_SUCCESS,REGISTER_FAIL,USER_LOADED,AUTH_ERROR,LOGIN_SUCCESS,LOGIN_FAIL,LOGOUT, CLEAR_PROFILE} from './types';
import setAuthToken from '../utils/setAuthToken';
 

export const loadUser=()=>async dispatch=>{
     if(localStorage.token){
      
        setAuthToken(localStorage.token)
     }

     try {
        
        const res =await axios.get('/api/auth');
        dispatch({
            type:USER_LOADED,
            payload:res.data 
        })
     } catch (err) {
        dispatch({
            type:AUTH_ERROR
        })
     }
}

export const authdonor=({name,email,password,bloodgroup,city})=>async dispatch=>{
    const config ={
        headers:{
            'Content-Type':'application/json'
        }
    }
    const body=JSON.stringify({name,email,password})


    const config2 ={// configuraion for profile 
        headers:{
            'Content-Type':'application/json',
            'x-auth-token':''
        }
    }
 
     console.log(bloodgroup,city)
     const location=city
     const body2=JSON.stringify({bloodgroup,location})

    try {
        
    const res= await axios.post('/api/users',body,config) 
    console.log(res.data.token)
    config2.headers['x-auth-token']=res.data.token
            
      await axios.post( 'api/profile',body2,config2)
    
        dispatch({
            type:REGISTER_SUCCESS,
            payload:res.data
        });

        dispatch(loadUser())
    } catch (err) {
        console.log(err)
        const errors=err.response.data;
        if(errors){
            errors.forEach(error =>dispatch (setAlert(error.msg,'danger'))
                
            );
        }
        dispatch({
            type:REGISTER_FAIL
        })
    }
}




export const LoginUser=(email,password)=>async dispatch=>{
    console.log('frm authdonor',email,password)
    const config ={
        headers:{
            'Content-Type':'application/json'
        }
    }
    
    const body=JSON.stringify({ email,password})

 
 
 
     
    try {
        
    const res= await axios.post('/api/auth',body,config) 
    console.log(res.data.token)
     
    
        dispatch({
            type:LOGIN_SUCCESS,
            payload:res.data
        });


        dispatch(loadUser())
    } catch (err) {
        console.log(err)
        const errors=err.response.data;
        console.log(errors)
        if(errors){
            errors.errors.forEach(error =>dispatch (setAlert(error.msg,'danger'))
                
            );
        }
        dispatch({
            type:LOGIN_FAIL
        })
    }
}


export const logout=()=>dispatch=>{
    dispatch({type:CLEAR_PROFILE})
    dispatch({type:LOGOUT})
    
    
}
 
export default authdonor;