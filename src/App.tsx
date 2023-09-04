import { useEffect, useRef, useState } from "react";

function CustomImage(props: { src: string; alt: string, onSave: (data: string) => void }) {
  const [position, setPosition] = useState('50% 50%');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const realZoom = zoom === 1 ? 'cover' : `${zoom * 100}%`

  const canvas = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const link = useRef<HTMLAnchorElement>(null);

  const zoomInPosition = (e: React.MouseEvent) => {
    // this will handle the calculations of the area where the image needs to zoom in depending on the user interaction
    const zoomer = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - zoomer.x) / zoomer.width) * 100;
    const y = ((e.clientY - zoomer.y) / zoomer.height) * 100;
    setPosition(`${x}% ${y}%`);
  };


  function zoomIn(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setZoom(zoom + 2);
    zoomInPosition(e);
  }

  function handleMove(e: React.MouseEvent) {
    // Handle the mouse move events
    if (zoom > 1) {
      zoomInPosition(e);
    }
  }

  function handleLeave(e: React.MouseEvent) {
    setZoom(1)
    zoomInPosition(e);
  }

  function setCWRotation(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRotation((r) => r + 90);
  }

  function setCCWRotation(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setRotation((r) => r - 90);
  }

  function saveCanvas(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (canvas.current) {
      const data = canvas.current.toDataURL() // base64 representation of the image
      props.onSave(data)
      if(link.current) {
        link.current.href = data;
        link.current.download = 'image.png';
        link.current.click()
      }
    }
  }


  function drawCanvas() {
    if (img.current && canvas.current) {
      const context = canvas.current.getContext('2d')
      canvas.current.width = img.current.width;
      canvas.current.height = img.current.height;
      context?.drawImage(img.current, 0, 0, img.current.width, img.current.height);

    }
  }

  function rotateCanvas() {
    if (img.current && canvas.current) {
      const context = canvas.current.getContext('2d')
      if (context) {
        // Calculate the diagonal length
        const diagonal = Math.sqrt(img.current.width * img.current.width + img.current.height * img.current.height);
        canvas.current.width = diagonal;
        canvas.current.height = diagonal;
        context.clearRect(0, 0, img.current.width, img.current.height);

        // save the unrotated context of the canvas so we can restore it later
        // the alternative is to untranslate & unrotate after drawing
        context.save();

        // move to the center of the canvas
        context.translate(canvas.current.width / 2, canvas.current.height / 2);

        // rotate the canvas to the specified degrees
        context.rotate(rotation * Math.PI / 180);

        // draw the image
        // since the context is rotated, the image will be rotated also
        context.drawImage(img.current, -img.current.width / 2, -img.current.width / 2, img.current.width, img.current.height);

        // we’re done with the rotating so restore the unrotated context
        context.restore();
      }

    }

  }
  useEffect(() => { rotateCanvas() }, [rotation])

  return (
    <div className="relative w-full h-full">
      <a href="" className="opacity-0 absolute bottom-0 -right-100" ref={link} />
      <canvas ref={canvas} className="absolute opacity-0 top-0 right-0 z-0" />
      <div className="absolute top-0 right-0 z-30">
        {rotation !== 0 ? (<button className="btn btn-xs btn-success" onClick={saveCanvas}>Save</button>) : null}
      </div>
      <div className="overflow-hidden cursor-zoom-in w-full relative z-20 " style={{
        backgroundImage: `url(${props.src})`,
        backgroundPosition: `${position}`,
        backgroundSize: realZoom,
        transform: `rotate(${rotation}deg)`
      }}

        onClick={zoomIn}
        onMouseOut={handleLeave}
        onMouseMove={handleMove}>
        <img {...props} className="opacity-0" ref={img} onLoad={drawCanvas} crossOrigin="anonymous" />
      </div>
      <div className="z-30 absolute bottom-0 right-0">
        <button className="btn btn-xs btn-success" onClick={setCWRotation}>+CW</button>
        <button className="btn btn-xs btn-success" onClick={setCCWRotation}>-CCW</button>
      </div>
    </div >

  )
}

function App() {

  const resultImg = useRef<HTMLImageElement>(null);

  function onSave(data: string) {
    if (resultImg.current) {
      resultImg.current.setAttribute('crossOrigin', 'anonymous');
      resultImg.current.src = data;
    }
  }

  return (
    <div className="max-w-5xl grid grid-cols-2 gap-8  mx-auto py-20">
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure><img src="https://res.cloudinary.com/matiasfha/image/upload/f_auto/q_auto/v1692040603/demos/car1.avif" alt="Shoes" /></figure>
        <div className="card-body">
          <h2 className="card-title">Normal Image</h2>
          <p>Just a simple img tag</p>
        </div>
      </div>
      <div className="card w-96 bg-base-100 shadow-xl">
        <figure><CustomImage src="https://res.cloudinary.com/matiasfha/image/upload/f_auto/q_auto/v1692040603/demos/car1.avif" alt="Shoes"
          onSave={onSave} /></figure>
      </div>

      <h1>Result</h1>
      <img ref={resultImg} />
    </div>
  )
}

export default App
