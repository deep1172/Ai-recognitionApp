"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface Person {
  id: string
  name: string
  imageUrl: string
}

export default function FaceGallery() {
  const { toast } = useToast()
  
  const [people, setPeople] = useState<Person[]>([
    
  ])

  const [newPerson, setNewPerson] = useState({
    name: "",
    image: null as File | null,
    imagePreview: "",
  })

  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
  
    const file = e.target.files[0];
  
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
  
    const reader = new FileReader();
    reader.onload = () => {
      setNewPerson({
        ...newPerson,
        image: file, // Store new file
        imagePreview: reader.result as string, // Update preview
      });
    };
    reader.readAsDataURL(file);
  };
  

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPerson({
      ...newPerson,
      name: e.target.value,
    })
  }

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!newPerson.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this person",
        variant: "destructive",
      });
      return;
    }
  
    if (!newPerson.image) {
      toast({
        title: "Image required",
        description: "Please upload an image for this person",
        variant: "destructive",
      });
      return;
    }
  
    setLoading(true);
  
    // Add new person to the UI immediately with local preview
    const tempId = Date.now().toString();
    setPeople([
      ...people,
      { id: tempId, name: newPerson.name, imageUrl: newPerson.imagePreview },
    ]);
  
    const formData = new FormData();
    formData.append("name", newPerson.name);
    formData.append("image", newPerson.image);
  
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
  
      console.log("Uploaded Image URL:", data.url);
  
      // Replace local preview with actual S3 URL
      setPeople((prevPeople) =>
        prevPeople.map((person) =>
          person.id === tempId ? { ...person, imageUrl: data.url } : person
        )
      );
  
      toast({
        title: "Person added",
        description: `${newPerson.name} has been added successfully.`,
      });
  
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
  
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
  
      // Remove the temporary UI update if upload fails
      setPeople((prevPeople) => prevPeople.filter((person) => person.id !== tempId));
    } finally {
      setLoading(false);
      setNewPerson({ name: "", image: null, imagePreview: "" });
    }
  };
  

  const handleDeletePerson = async (id: string) => {
    try {
      // Simulate API call to delete person
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Remove person from the list
      setPeople(people.filter((person) => person.id !== id))

      toast({
        title: "Person removed",
        description: "Person has been removed from your database",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove person from database",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddPerson} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <Label htmlFor="person-image" className="block mb-2">
              Person Image
            </Label>
            {newPerson.imagePreview ? (
              <div className="relative h-40 w-full rounded-md overflow-hidden">
                <Image
                  src={newPerson.imagePreview || "/placeholder.svg"}
                  alt="New person preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => setNewPerson({ ...newPerson, image: null, imagePreview: "" })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Label
                htmlFor="person-image-upload"
                className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload face image</span>
                <Input
                  id="person-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </Label>
            )}
          </div>

          <div className="col-span-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="person-name" className="block mb-2">
                  Person Name
                </Label>
                <Input
                  id="person-name"
                  type="text"
                  placeholder="Enter name"
                  value={newPerson.name}
                  onChange={handleNameChange}
                />
              </div>

              <Button type="submit" className="w-full" disabled={!newPerson.name || !newPerson.image || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <div>
        <h3 className="text-lg font-medium mb-4">People in Database</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {people.map((person) => (
            <Card key={person.id} className="overflow-hidden">
              <div className="relative h-40 w-full">
                <Image src={person.imageUrl || "/placeholder.svg"} alt={person.name} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{person.name}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleDeletePerson(person.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

