"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users, BookOpen, GraduationCap } from "lucide-react"

export default function ProfesseurPage() {
  const [profil, setProfil] = useState<any>(null)
  const [etudiantsParNiveau, setEtudiantsParNiveau] = useState<any>({})
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [noteData, setNoteData] = useState({
    etudiantId: "",
    moduleId: "",
    valeur: "",
  })

  useEffect(() => {
    fetchProfil()
    fetchEtudiants()
  }, [])

  const fetchProfil = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/professeur/profil", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setProfil(data.profil) // Le controller retourne { profil: professeur }
      }
    } catch (err) {
      setError("Erreur lors du chargement du profil")
    }
  }

  const fetchEtudiants = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/professeur/etudiants-par-niveau", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setEtudiantsParNiveau(data.etudiantsParNiveau) // Le controller retourne { etudiantsParNiveau: {...} }
      }
    } catch (err) {
      setError("Erreur lors du chargement des étudiants")
    }
  }

  const handleSaisirNote = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/api/professeur/saisir-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          etudiantId: noteData.etudiantId,
          moduleId: Number.parseInt(noteData.moduleId),
          valeur: Number.parseFloat(noteData.valeur),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(data.message || "Note enregistrée avec succès")
        setNoteData({ etudiantId: "", moduleId: "", valeur: "" })
        setError("")
      } else {
        const data = await response.json()
        setError(data.error || "Erreur lors de la saisie")
      }
    } catch (err) {
      setError("Erreur lors de la saisie de la note")
    }
  }

  const getAllEtudiants = () => {
    const allEtudiants: any[] = []
    Object.values(etudiantsParNiveau).forEach((etudiants: any) => {
      allEtudiants.push(...etudiants)
    })
    return allEtudiants
  }

  return (
    <DashboardLayout title="Espace Professeur">
      <div className="space-y-6">
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profil" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profil">Mon Profil</TabsTrigger>
            <TabsTrigger value="modules">Mes Modules</TabsTrigger>
            <TabsTrigger value="etudiants">Étudiants par Niveau</TabsTrigger>
            <TabsTrigger value="notes">Saisir Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="profil">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Mon Profil Professeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profil ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nom</Label>
                      <p className="text-lg font-medium">{profil.nom}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p>{profil.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Code Professeur</Label>
                      <p className="font-mono bg-muted px-2 py-1 rounded">{profil.code}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Université</Label>
                      <p>{profil.universite?.nom || "Non définie"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Rôle</Label>
                      <p className="capitalize">{profil.role}</p>
                    </div>
                  </div>
                ) : (
                  <p>Chargement du profil...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Mes Modules d'Enseignement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profil?.modules && profil.modules.length > 0 ? (
                  <div className="grid gap-4">
                    {profil.modules.map((module: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-card">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{module.nom}</h3>
                            <p className="text-sm text-muted-foreground">Code: {module.code}</p>
                            <p className="text-sm text-muted-foreground">Crédits: {module.credit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Niveau: {module.niveau?.nom}</p>
                            <p className="text-sm text-muted-foreground">UE: {module.ue?.nom}</p>
                          </div>
                        </div>
                        {module.description && (
                          <p className="text-sm text-muted-foreground mt-2">{module.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Aucun module assigné</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="etudiants">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Étudiants par Niveau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.keys(etudiantsParNiveau).length > 0 ? (
                    Object.entries(etudiantsParNiveau).map(([niveau, etudiants]: [string, any]) => (
                      <div key={niveau} className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-3 flex items-center">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          {niveau} ({etudiants.length} étudiant{etudiants.length > 1 ? "s" : ""})
                        </h3>
                        <div className="grid gap-3">
                          {etudiants.map((etudiant: any) => (
                            <div key={etudiant.id} className="p-3 bg-muted rounded-lg">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{etudiant.nom}</p>
                                  <p className="text-sm text-muted-foreground">{etudiant.email}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-mono bg-background px-2 py-1 rounded">ID: {etudiant.id}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Aucun étudiant trouvé</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Saisir une Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaisirNote} className="space-y-4">
                  <div>
                    <Label htmlFor="etudiant">Étudiant</Label>
                    <select
                      id="etudiant"
                      className="w-full p-2 border rounded-md bg-background"
                      value={noteData.etudiantId}
                      onChange={(e) => setNoteData({ ...noteData, etudiantId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un étudiant</option>
                      {getAllEtudiants().map((etudiant: any) => (
                        <option key={etudiant.id} value={etudiant.id}>
                          {etudiant.nom} ({etudiant.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="module">Module</Label>
                    <select
                      id="module"
                      className="w-full p-2 border rounded-md bg-background"
                      value={noteData.moduleId}
                      onChange={(e) => setNoteData({ ...noteData, moduleId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner un module</option>
                      {profil?.modules?.map((module: any) => (
                        <option key={module.id} value={module.id}>
                          {module.nom} ({module.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="note">Note (sur 20)</Label>
                    <Input
                      id="note"
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      value={noteData.valeur}
                      onChange={(e) => setNoteData({ ...noteData, valeur: e.target.value })}
                      placeholder="Ex: 15.5"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Enregistrer la Note
                  </Button>
                </form>

                {profil?.modules && profil.modules.length > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Mes modules d'enseignement :</h4>
                    <div className="text-sm space-y-1">
                      {profil.modules.map((module: any, index: number) => (
                        <p key={index} className="text-muted-foreground">
                          • {module.nom} (ID: {module.id}) - {module.niveau?.nom}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
