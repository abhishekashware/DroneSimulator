import React, { useEffect,  useState } from 'react'
import { Container, InnerContainer } from '../styledComponents'
import { GoogleMap, MarkerF, PolylineF, useJsApiLoader } from '@react-google-maps/api';
import {useForm} from 'react-hook-form'
import Pause from '../assets/Pause.png'
import Play from '../assets/Play.png'
let interval;
const MapComponent = () => {
    const [map, setMap] = React.useState(null);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [isSimulationRunning,setIsSimulationRunning]=useState(false);
    const {register,handleSubmit,formState: { errors }}=useForm();
    const [pointsList,setPointsList]=useState([
        {
            "lat": 23.274967,
            "lng": 77.421697,
            "timestamp": 12345
        }
    ]);
    const [seekIndex,setSeekIndex]=useState(0);

    const customIcon = {
        url: 'https://png.pngtree.com/png-vector/20240607/ourmid/pngtree-revolutionizing-aerial-surveillance-with-drones-top-view-of-drone-for-agriculture-png-image_12574991.png', 
        scaledSize: new window.google.maps.Size(50, 50),
      };
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyA-Iv94hhZgObeR3t95YvB8HJHmjhGVy1k"
    })

    const startInterval=()=>{
        setIsSimulationRunning(true);
        interval = setInterval(() => {
             if(seekIndex==(pointsList.length-1)){
                 stopInterval();
                 false;
             }
             setSeekIndex((prevIndex) => {
               const nextIndex = prevIndex + 1;
               if (nextIndex >= pointsList.length) {
                stopInterval();
                 return prevIndex; 
               }
               return nextIndex;
             });
           }, pointsList[seekIndex+1]-pointsList[seekIndex]); 
    }

    const stopInterval=()=>{
        setIsSimulationRunning(false);
        clearInterval(interval);
    }


    const onLoad = React.useCallback(function callback(map) {
      const bounds = new window.google.maps.LatLngBounds(pointsList[seekIndex]);
      map.fitBounds(bounds);
  
      setMap(map)
    }, []);

  const uploadFile=(e)=>{
    const file = e.target.files[0]; 
    console.log(file);
    setIsSimulationRunning(false);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(e.target.result);
        const fileContent = e.target.result;
        try {
            setIsFileUploaded(true);
          const parsedData = JSON.parse(fileContent);  
          setPointsList(parsedData.data);
          console.log('Parsed Data:', parsedData);
        } catch (error) {
          console.error('Error parsing file:', error);
        }
      };
      reader.readAsText(file); 
    }else{
        setPointsList([{
            lat:23.274967,
            lng:77.421697,
            timestamp:123456
        }]);
        setIsFileUploaded(false);
        setSeekIndex(0);
        interval=null;
    }
  }
useEffect(() => {
    if (map && pointsList[seekIndex]) {
      map.panTo(pointsList[seekIndex]); 
      map.setZoom(16); 
    }

  }, [seekIndex, map]);

    
    const reset=(e)=>{
        clearInterval(interval);
        interval=null;
        setSeekIndex(0);
        setPointsList([{
            lat:23.274967,
            lng:77.421697,
            timestamp:123456
        }]);
    }
    const handleSeekBarChange=(e)=>{
        console.log(e.target.value);
        if(interval) clearInterval(interval);
        setSeekIndex(parseInt(e.target.value));
    }
    const addRow=(e)=>{
        setPointsList(
            [...pointsList,
                {
                    lat:23.274967,
                    lng:77.421697,
                    timestamp:123456
                }]
        )
    }
    const handlePausePlay=()=>{
        if(isSimulationRunning){
            stopInterval();
        }else{
            startInterval();
        }
    }
    const deleteRow=(index)=>{
       
        setPointsList(
           prevList=> prevList.filter((i,ind)=>(index!=ind))
        )
    }
    const submitForm=(e)=>{
        console.log(pointsList);
        // map.setPointsList(pointsList);
        if(!interval){
         startInterval();
        }
    }
    const style={flex:1,height:'500px',width:'500px'};
    return (
    <Container>
        <div style={{textAlign:'center'}}>
        <h1>Drone Simulator</h1>
        <h3>Note:- Amount of difference between timestamps will be delay considered for change of position of drone</h3>
        </div>
        <InnerContainer>
            {isLoaded?(
        <GoogleMap key={seekIndex} onDblClick={()=>console.log(pointsList)} mapContainerStyle={style} center={pointsList[seekIndex]} onLoad={onLoad} zoom={10}>
        {(pointsList.length>1) && (
            <PolylineF
          path={pointsList} 
          options={{
            strokeColor: '#ee0606',
            strokeOpacity: 1,
            strokeWeight: 2,
          }}
        />)}
    <MarkerF icon={customIcon} position={pointsList[seekIndex]} />

        </GoogleMap>):(<div style={style}><h1>Map is Loading.....</h1></div>)
        }
       <form style={{minWidth:'600px'}} onSubmit={handleSubmit(submitForm)}>
        <div style={{display:'flex',flexWrap:'wrap',gap:'10px',marginBottom:'10px'}}>
            <button type='submit' style={{backgroundColor:'green',color:'white',padding:'5px',width:'100px',borderRadius:'50px'}}>Simulate</button>
            <button style={{width:'100px',borderRadius:'50px',backgroundColor:'black',color:'white',padding:'5px'}} onClick={reset}>Reset</button>
            <a href="/src/assets/sample.json" target="_blank" download style={{color:'black',border:'1px solid black',borderRadius:'10px',backgroundColor:'white',padding:'10px 10px',width:'90px',textDecoration:'none'}}>
            Download Sample Json
            </a>
            <input id="file" type='file' onChange={uploadFile} style={{width:'180px',border:'1px solid black'}}/>
            {(pointsList.length>2)&&(<img src={isSimulationRunning?Pause:Play} style={{width:'40px',height:'40px',cursor:'pointer'}} onClick={handlePausePlay}/>)}
        </div>
        <b>Current Position: {seekIndex}</b>
        <input
                type="range"
                min="0"
                max={pointsList.length-1}
                value={seekIndex}
                onChange={handleSeekBarChange}
                style={{ width: '100%' }}
            />

        {
           (!isFileUploaded)? pointsList.map((i,index)=>(
                <>
                <div key={index} style={{display:'flex',marginTop:'10px',gap:'10px'}}>
                <input type='number' placeholder='enter latitude' step='any'
                {...register(`latitude${index}`,{
                    required:'latitude is required'
                })} onChange={(e)=>setPointsList(prevList=>prevList.map((item,ind)=>(index==ind)?{...item,lat:parseFloat(e.target.value)}:item))} />
                <input type='number' placeholder='enter longitude' step='any'
                {...register(`longitude${index}`,{
                    required:'longitude is required'
                })}
                onChange={(e)=>setPointsList(prevList=>prevList.map((item,ind)=>(index==ind)?{...item,lng:parseFloat(e.target.value)}:item))} 
                />
                <input type='tel' placeholder='timestamp in milliseconds' step='any'
                {...register(`timestamp${index}`,{
                    required:'timestamp is required'
                })}
                maxLength="4"
                onInput={e=>{if(parseInt(e.target.value)>9999){return;}}}
                onChange={(e)=>setPointsList(prevList=>prevList.map((item,ind)=>(index==ind)?{...item,timestamp:parseInt(e.target.value)}:item))} 
                />
                    {(index==(pointsList.length-1))?(<button  onClick={addRow} style={{fontWeight:'bold',borderRadius:'50%',backgroundColor:'skyblue',padding:'10px',width:'40px',color:'black'}}>+</button>):
                (<button  onClick={(e)=>deleteRow(index)} style={{borderRadius:'50%',fontWeight:'bold',backgroundColor:'skyblue',padding:'10px',width:'40px',color:'black'}}>-</button>)
                    }
                    
                </div>
                <div style={{display:'flex',gap:'10px',color:'red'}}>
                {errors[`latitude${index}`] && <span>{errors[`latitude${index}`].message}</span>}
                {errors[`longitude${index}`] && <span>{errors[`longitude${index}`].message}</span>}
                {errors[`timestamp${index}`] && <span>{errors[`timestamp${index}`].message}</span>}
                </div>
                </>
            )):(<h1>File Uploaded Successfully</h1>)
        }
       </form>
       </InnerContainer>
    </Container>
  )
}

export default MapComponent