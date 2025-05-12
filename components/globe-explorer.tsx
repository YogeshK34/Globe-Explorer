"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Globe, Info, MapPin, Sparkles } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import gsap from "gsap"

// Sample location data
const LOCATIONS = [
  { id: 1, name: "New York", lat: 40.7128, lng: -74.006, description: "The Big Apple" },
  { id: 2, name: "Tokyo", lat: 35.6762, lng: 139.6503, description: "Japan's bustling capital" },
  { id: 3, name: "Paris", lat: 48.8566, lng: 2.3522, description: "City of Love" },
  { id: 4, name: "Sydney", lat: -33.8688, lng: 151.2093, description: "Harbor city" },
  { id: 5, name: "Cape Town", lat: -33.9249, lng: 18.4241, description: "Mother City" },
]

export function GlobeExplorer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeLocation, setActiveLocation] = useState<(typeof LOCATIONS)[0] | null>(null)
  const [globeSpeed, setGlobeSpeed] = useState(0.2)
  const [showInfo, setShowInfo] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 2

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // Create globe
    const globeGeometry = new THREE.SphereGeometry(1, 64, 64)

    // Earth texture
    const textureLoader = new THREE.TextureLoader()
    const earthTexture = textureLoader.load("/placeholder.svg?height=2048&width=4096")
    const bumpMap = textureLoader.load("/placeholder.svg?height=1024&width=2048")
    const specularMap = textureLoader.load("/placeholder.svg?height=1024&width=2048")

    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpMap,
      bumpScale: 0.05,
      specularMap: specularMap,
      specular: new THREE.Color(0x333333),
      shininess: 5,
    })

    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    scene.add(globe)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    // Add location markers
    const markerGroup = new THREE.Group()
    scene.add(markerGroup)

    LOCATIONS.forEach((location) => {
      const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16)
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3e00,
        transparent: true,
        opacity: 0.8,
      })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)

      // Convert lat/lng to 3D position
      const phi = (90 - location.lat) * (Math.PI / 180)
      const theta = (location.lng + 180) * (Math.PI / 180)

      marker.position.x = -1 * Math.sin(phi) * Math.cos(theta)
      marker.position.y = Math.cos(phi)
      marker.position.z = Math.sin(phi) * Math.sin(theta)

      marker.userData = { location }
      markerGroup.add(marker)

      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(0.025, 16, 16)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3e00,
        transparent: true,
        opacity: 0.4,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.copy(marker.position)
      markerGroup.add(glow)
    })

    // Add stars
    const starGeometry = new THREE.BufferGeometry()
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
    })

    const starVertices = []
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000
      const y = (Math.random() - 0.5) * 2000
      const z = (Math.random() - 0.5) * 2000
      starVertices.push(x, y, z)
    }

    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.minDistance = 1.5
    controls.maxDistance = 4
    controls.enablePan = false

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    // Raycaster for marker interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(markerGroup.children)

      if (intersects.length > 0) {
        const marker = intersects[0].object
        if (marker.userData && marker.userData.location) {
          document.body.style.cursor = "pointer"
        }
      } else {
        document.body.style.cursor = "default"
      }
    }

    const handleClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(markerGroup.children)

      if (intersects.length > 0) {
        const marker = intersects[0].object
        if (marker.userData && marker.userData.location) {
          setActiveLocation(marker.userData.location)
          setShowInfo(true)

          // Animate camera to marker position
          const targetPosition = new THREE.Vector3().copy(marker.position).multiplyScalar(2)
          gsap.to(camera.position, {
            duration: 1,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            onUpdate: () => {
              camera.lookAt(scene.position)
            },
          })
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("click", handleClick)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Rotate globe
      globe.rotation.y += globeSpeed * 0.005

      // Update controls
      controls.update()

      // Render scene
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [globeSpeed])

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="absolute inset-0" />

      {/* UI Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4">
        <Card className="backdrop-blur-md bg-background/70 border-none shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Globe Explorer
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)}>
                <Info className="h-5 w-5" />
              </Button>
            </div>
            {showInfo && (
              <CardDescription>
                Explore our beautiful planet with this interactive 3D globe. Click on markers to learn about different
                locations.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="explore" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="explore">Explore</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="explore" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {LOCATIONS.map((location) => (
                      <Button
                        key={location.id}
                        variant={activeLocation?.id === location.id ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => setActiveLocation(location)}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        {location.name}
                      </Button>
                    ))}
                  </div>

                  {activeLocation && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{activeLocation.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {activeLocation.lat.toFixed(2)}, {activeLocation.lng.toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{activeLocation.description}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="settings" className="pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Rotation Speed</span>
                    <span className="text-sm text-muted-foreground">{globeSpeed.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[globeSpeed]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => setGlobeSpeed(value[0])}
                  />
                </div>
                <Button className="w-full" onClick={() => setGlobeSpeed(0.2)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Reset Settings
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-xs text-center w-full text-muted-foreground">
              Click and drag to rotate • Scroll to zoom
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
