"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, BookOpen, BarChart3, Award } from "lucide-react"

export default function EtudiantPage() {
  const [profil, setProfil] = useState<any>(null)
  const [notesData, setNotesData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProfil()
    fetchNotes()
  }, [])

  const fetchProfil = async () => {
    try {
      const response = await fetch("https://univ-backend-ynxx.onrender.com/api/etudiants/profil", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setProfil(data.profil) // Le controller retourne { profil: etudiant }
      }
    } catch (err) {
      setError("Erreur lors du chargement du profil")
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch("https://univ-backend-ynxx.onrender.com/api/etudiants/notes", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setNotesData(data) // Le controller retourne { modules, totalCredits, creditsRestants }
      }
    } catch (err) {
      setError("Erreur lors du chargement des notes")
    }
  }

  const calculerMoyenne = () => {
    if (!notesData?.modules || notesData.modules.length === 0) return 0
    const total = notesData.modules.reduce((sum: number, module: any) => sum + module.note, 0)
    return (total / notesData.modules.length).toFixed(2)
  }

  return (
    <DashboardLayout title="Espace Étudiant">
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profil" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profil">Mon Profil</TabsTrigger>
            <TabsTrigger value="notes">Mes Notes</TabsTrigger>
            <TabsTrigger value="credits">Mes Crédits</TabsTrigger>
            <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="profil">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Mon Profil
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profil ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nom</label>
                      <p className="text-lg font-medium">{profil.nom}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p>{profil.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Code Étudiant</label>
                      <p className="font-mono bg-muted px-2 py-1 rounded">{profil.code}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Niveau</label>
                      <p>{profil.niveau?.nom || "Non défini"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Rôle</label>
                      <p className="capitalize">{profil.role}</p>
                    </div>
                  </div>
                ) : (
                  <p>Chargement du profil...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Mes Notes par Module
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notesData?.modules && notesData.modules.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium">Module</th>
                            <th className="text-left p-3 font-medium">Note</th>
                            <th className="text-left p-3 font-medium">Crédits</th>
                            <th className="text-left p-3 font-medium">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notesData.modules.map((module: any, index: number) => (
                            <tr key={index} className="border-b hover:bg-muted/50">
                              <td className="p-3">{module.module}</td>
                              <td className="p-3">
                                <span
                                  className={`font-medium ${module.note >= 10 ? "text-success" : "text-destructive"}`}
                                >
                                  {module.note}/20
                                </span>
                              </td>
                              <td className="p-3">{module.credit}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    module.note >= 10
                                      ? "bg-success/10 text-success"
                                      : "bg-destructive/10 text-destructive"
                                  }`}
                                >
                                  {module.note >= 10 ? "Validé" : "Non validé"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune note disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Gestion des Crédits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notesData ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-primary/5 rounded-lg border">
                      <h3 className="text-sm font-medium text-primary mb-2">Crédits Obtenus</h3>
                      <p className="text-3xl font-bold text-primary">{notesData.totalCredits}</p>
                      <p className="text-sm text-muted-foreground mt-1">Modules validés (≥10/20)</p>
                    </div>

                    <div className="p-6 bg-warning/5 rounded-lg border">
                      <h3 className="text-sm font-medium text-warning mb-2">Crédits Restants</h3>
                      <p className="text-3xl font-bold text-warning">{notesData.creditsRestants}</p>
                      <p className="text-sm text-muted-foreground mt-1">À valider</p>
                    </div>

                    <div className="p-6 bg-muted rounded-lg border">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Crédits</h3>
                      <p className="text-3xl font-bold">{notesData.totalCredits + notesData.creditsRestants}</p>
                      <p className="text-sm text-muted-foreground mt-1">Crédits du niveau</p>
                    </div>
                  </div>
                ) : (
                  <p>Chargement des informations de crédits...</p>
                )}

                {notesData && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Progression</h3>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (notesData.totalCredits / (notesData.totalCredits + notesData.creditsRestants)) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round(
                        (notesData.totalCredits / (notesData.totalCredits + notesData.creditsRestants)) * 100,
                      )}
                      % des crédits validés
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistiques">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Statistiques Académiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Nombre de Modules</h3>
                    <p className="text-2xl font-bold text-blue-900">{notesData?.modules?.length || 0}</p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Moyenne Générale</h3>
                    <p className="text-2xl font-bold text-green-900">{calculerMoyenne()}/20</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-600">Modules Validés</h3>
                    <p className="text-2xl font-bold text-purple-900">
                      {notesData?.modules?.filter((module: any) => module.note >= 10).length || 0}
                    </p>
                  </div>
                </div>

                {notesData?.modules && notesData.modules.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Répartition des Notes par Module</h3>
                    <div className="space-y-3">
                      {notesData.modules.map((module: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4">
                          <span className="w-32 text-sm truncate font-medium">{module.module}</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                module.note >= 10 ? "bg-success" : "bg-destructive"
                              }`}
                              style={{ width: `${(module.note / 20) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-16 text-right">{module.note}/20</span>
                          <span className="text-xs text-muted-foreground w-12 text-right">{module.credit}cr</span>
                        </div>
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
