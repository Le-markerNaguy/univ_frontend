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
import { Plus, Building, UserPlus, Users, Eye, Building2, School, BookOpen } from "lucide-react"

interface Universite {
  id: number
  nom: string
  facultes?: Faculte[]
}

interface Admin {
  id: string
  nom: string
  email: string
  motDePasse: string
  universite?: { nom: string }
}

interface Faculte {
  id: number
  nom: string
  universiteId: number
  filieres?: Filiere[]
}

interface Filiere {
  id: number
  nom: string
  faculteId: number
  niveaux?: Niveau[]
}

interface Niveau {
  id: number
  nom: string
  filiereId: number
}

interface Module {
  id: number
  nom: string
  credit: number
  niveau?: { nom: string }
  ue?: { intitule: string }
}

export default function SuperAdminPage() {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  // États pour les données
  const [universites, setUniversites] = useState<Universite[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [modules, setModules] = useState<Module[]>([])

  // États pour les formulaires
  const [universiteData, setUniversiteData] = useState({
    nom: "",
  })

  const [adminData, setAdminData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    universiteId: "",
  })

  const [superAdminData, setSuperAdminData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [universitesRes, adminsRes, facultesRes, filieresRes, niveauxRes, modulesRes] = await Promise.all([
        fetch("http://localhost:4000/api/super-admin/universites", { credentials: "include" }),
        fetch("http://localhost:4000/api/super-admin/admins", { credentials: "include" }),
        fetch("http://localhost:4000/api/facultes", { credentials: "include" }),
        fetch("http://localhost:4000/api/filieres", { credentials: "include" }),
        fetch("http://localhost:4000/api/niveaux", { credentials: "include" }),
        fetch("http://localhost:4000/api/modules", { credentials: "include" }),
      ])

      if (universitesRes.ok) setUniversites(await universitesRes.json())
      if (adminsRes.ok) setAdmins(await adminsRes.json())
      if (facultesRes.ok) setFacultes(await facultesRes.json())
      if (filieresRes.ok) setFilieres(await filieresRes.json())
      if (niveauxRes.ok) setNiveaux(await niveauxRes.json())
      if (modulesRes.ok) setModules(await modulesRes.json())
    } catch (err) {
      setError("Erreur lors du chargement des données")
    }
  }

  const handleCreateUniversite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/api/super-admin/universites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(universiteData),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage("Université créée avec succès")
        setUniversiteData({ nom: "" })
        fetchAllData()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Erreur lors de la création de l'université")
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/api/super-admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nom: adminData.nom,
          email: adminData.email,
          motDePasse: adminData.motDePasse, // Mot de passe = email (hashé)
          universiteId: Number(adminData.universiteId),
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage("Admin créé avec succès")
        setAdminData({ nom: "", email: "", motDePasse: "", universiteId: "" })
        fetchAllData()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Erreur lors de la création de l'admin")
    }
  }

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/api/super-admin/super-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(superAdminData),
      })

      const data = await response.json()
      if (response.ok) {
        setMessage("Super Admin créé avec succès")
        setSuperAdminData({ nom: "", email: "", motDePasse: "" })
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Erreur lors de la création du Super Admin")
    }
  }

  const getFacultesForUniversite = (universiteId: number) => {
    return facultes.filter((faculte) => faculte.universiteId === universiteId)
  }

  const getFilieresForFaculte = (faculteId: number) => {
    return filieres.filter((filiere) => filiere.faculteId === faculteId)
  }

  const getNiveauxForFiliere = (filiereId: number) => {
    return niveaux.filter((niveau) => niveau.filiereId === filiereId)
  }

  const getTotalCredits = () => {
    return modules.reduce((total, module) => total + module.credit, 0)
  }

  return (
    <DashboardLayout title="Super Administration">
      <div className="space-y-6">
        {message && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="universites">Universités</TabsTrigger>
            <TabsTrigger value="admins">Administrateurs</TabsTrigger>
            <TabsTrigger value="super-admins">Super Admins</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Universités</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{universites.length}</div>
                  <p className="text-xs text-muted-foreground">{facultes.length} facultés au total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{admins.length}</div>
                  <p className="text-xs text-muted-foreground">Gèrent {universites.length} universités</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Filières</CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filieres.length}</div>
                  <p className="text-xs text-muted-foreground">{niveaux.length} niveaux d'études</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Modules</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{modules.length}</div>
                  <p className="text-xs text-muted-foreground">{getTotalCredits()} crédits au total</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Architecture du Système Universitaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {universites.map((universite) => (
                    <div
                      key={universite.id}
                      className="border rounded-lg p-4 bg-gradient-to-r from-primary/5 to-secondary/5"
                    >
                      <h3 className="text-lg font-bold text-primary mb-3">🏛️ {universite.nom}</h3>

                      {getFacultesForUniversite(universite.id).map((faculte) => (
                        <div key={faculte.id} className="ml-4 mb-3 border-l-2 border-secondary/30 pl-4">
                          <h4 className="font-semibold text-secondary">🏢 {faculte.nom}</h4>

                          {getFilieresForFaculte(faculte.id).map((filiere) => (
                            <div key={filiere.id} className="ml-4 mt-2 border-l-2 border-muted/50 pl-4">
                              <h5 className="font-medium text-foreground">📚 {filiere.nom}</h5>

                              <div className="ml-4 mt-1 flex flex-wrap gap-2">
                                {getNiveauxForFiliere(filiere.id).map((niveau) => (
                                  <span
                                    key={niveau.id}
                                    className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                                  >
                                    📖 {niveau.nom}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                      {getFacultesForUniversite(universite.id).length === 0 && (
                        <p className="ml-4 text-sm text-muted-foreground italic">Aucune faculté créée</p>
                      )}
                    </div>
                  ))}

                  {universites.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Building className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Aucune université créée pour le moment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="universites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Gestion des Universités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUniversite} className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="universiteNom">Nom de l'université</Label>
                    <Input
                      id="universiteNom"
                      value={universiteData.nom}
                      onChange={(e) => setUniversiteData({ ...universiteData, nom: e.target.value })}
                      placeholder="ex: Université de Paris"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer l'université
                  </Button>
                </form>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Universités créées ({universites.length})</h3>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {universites.map((universite) => (
                      <div key={universite.id} className="p-3 border rounded-lg bg-card">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{universite.nom}</h4>
                            <p className="text-sm text-muted-foreground">
                              {getFacultesForUniversite(universite.id).length} faculté(s) •
                              {admins.filter((admin) => admin.universite?.nom === universite.nom).length} admin(s)
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">ID: {universite.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Gestion des Administrateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adminNom">Nom complet</Label>
                      <Input
                        id="adminNom"
                        value={adminData.nom}
                        onChange={(e) => setAdminData({ ...adminData, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={adminData.email}
                        onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminMotDePasse">Mot de passe</Label>
                      <Input
                        id="adminMotDePasse"
                        type="password"
                        value={adminData.motDePasse}
                        onChange={(e) => setAdminData({ ...adminData, motDePasse: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="adminUniversite">Université</Label>
                      <select
                        id="adminUniversite"
                        className="w-full p-2 border rounded-md bg-input"
                        value={adminData.universiteId}
                        onChange={(e) => setAdminData({ ...adminData, universiteId: e.target.value })}
                        required
                      >
                        <option value="">Sélectionner une université</option>
                        {universites.map((universite) => (
                          <option key={universite.id} value={universite.id}>
                            {universite.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer l'administrateur (Mot de passe = email)
                  </Button>
                </form>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note :</strong> Le mot de passe de l'administrateur sera automatiquement défini comme son
                    email (hashé).
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Administrateurs créés ({admins.length})</h3>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {admins.map((admin) => (
                      <div key={admin.id} className="p-3 border rounded-lg bg-card">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{admin.nom}</h4>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{admin.universite?.nom}</p>
                            <p className="text-xs text-muted-foreground">Rôle: ADMIN</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="super-admins">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Création de Super Administrateurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSuperAdmin} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="superAdminNom">Nom complet</Label>
                      <Input
                        id="superAdminNom"
                        value={superAdminData.nom}
                        onChange={(e) => setSuperAdminData({ ...superAdminData, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="superAdminEmail">Email</Label>
                      <Input
                        id="superAdminEmail"
                        type="email"
                        value={superAdminData.email}
                        onChange={(e) => setSuperAdminData({ ...superAdminData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="superAdminPassword">Mot de passe</Label>
                      <Input
                        id="superAdminPassword"
                        type="password"
                        value={superAdminData.motDePasse}
                        onChange={(e) => setSuperAdminData({ ...superAdminData, motDePasse: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer le Super Administrateur
                  </Button>
                </form>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Attention :</strong> Les Super Administrateurs ont accès à toutes les fonctionnalités du
                    système. Créez ces comptes avec précaution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="mr-2 h-5 w-5" />
                    Répartition par Université
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {universites.map((universite) => {
                      const facultesCount = getFacultesForUniversite(universite.id).length
                      const adminsCount = admins.filter((admin) => admin.universite?.nom === universite.nom).length

                      return (
                        <div key={universite.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium">{universite.nom}</h4>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-muted-foreground">
                            <span>📚 {facultesCount} facultés</span>
                            <span>👥 {adminsCount} admins</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions Système</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => fetchAllData()}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Actualiser toutes les données
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => {
                        setMessage("")
                        setError("")
                      }}
                    >
                      Effacer les notifications
                    </Button>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Dernière mise à jour: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
