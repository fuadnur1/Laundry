import {useEffect,useState} from "react";
import api from "../api/axios";
import ServiceCard from "../components/ServiceCard";


function Home(){

const [services,setServices]=useState([]);


useEffect(()=>{

    api.get("/services")
    .then(res=>{

        setServices(res.data.data);

    })
    .catch(err=>{

        console.log(err);

    });


},[]);



return(

<div>

<h1>
Laundry Services
</h1>


{
services.map(service=>(

<ServiceCard 
key={service.id}
service={service}
/>

))
}


</div>

)

}


export default Home;