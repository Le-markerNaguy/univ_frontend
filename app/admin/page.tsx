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
import {
  Plus,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  Building2,
  School,
  Layers,
  Edit,
  Trash2,
  Star,
  Check,
  X,
} from "lucide-react"

interface Etudiant {
  id: string
  nom: string
  email: string
  code: string
  niveau?: { nom: string }
}

interface Module {
  id: number
  nom: string
  ueId: number
  ue?: { intitule: string }
}

interface UE {
  id: number
  code: string
  intitule: string // Changé de 'nom' à 'intitule' pour correspondre au contrôleur
  credits?: number
  semestreId: number
  semestre?: { nom: string }
}

interface Professeur {
  id: string
  nom: string
  email: string
  code: string
}

interface Semestre {
  id: number
  nom: string
  credits: number
  niveauId: number // Ajout de niveauId comme propriété directe
  niveau?: { nom: string }
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
  niveauId: number
  ueId: number
  code: string
  professeurId?: string
  ue?: { intitule: string }
  niveau?: { nom: string }
  professeur?: { nom: string }
}

export default function AdminPage() {
  const [userData, setUserData] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const [etudiants, setEtudiants] = useState<Etudiant[]>([])
  const [professeurs, setProfesseurs] = useState<Professeur[]>([])
  const [semestres, setSemestres] = useState<Semestre[]>([])
  const [ues, setUes] = useState<UE[]>([])
  const [facultes, setFacultes] = useState<Faculte[]>([])
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [niveaux, setNiveaux] = useState<Niveau[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [notes, setNotes] = useState<any[]>([])

  const [etudiantData, setEtudiantData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    niveauId: "",
  })

  const [professeurData, setProfesseurData] = useState({
    nom: "",
    email: "",
    motDePasse: "",
    modulesIds: [] as number[], // Ajout des modules pour le professeur
  })

  const [semestreData, setSemestreData] = useState({
    nom: "",
    niveauId: "",
  })

  const [ueData, setUeData] = useState({
    intitule: "", // Changé de 'nom' à 'intitule'
    credits: 0, // Ajout des crédits
    semestreId: "",
  })

  const [noteData, setNoteData] = useState({
    etudiantId: "",
    moduleId: "",
    note: "",
  })

  const [faculteData, setFaculteData] = useState({
    nom: "",
    universiteId: "", // Sera mis à jour avec l'universiteId de l'admin
  })

  const [filiereData, setFiliereData] = useState({
    nom: "",
    faculteId: "",
  })

  const [niveauData, setNiveauData] = useState({
    nom: "",
    filiereId: "",
  })

  const [moduleData, setModuleData] = useState({
    nom: "",
    credit: "",
    niveauId: "",
    ueId: "",
    professeurId: "",
  })

  const [editingFaculte, setEditingFaculte] = useState<Faculte | null>(null)
  const [editFaculteData, setEditFaculteData] = useState({
    nom: "",
  })

  const [editingFiliere, setEditingFiliere] = useState<Filiere | null>(null)
  const [editFiliereData, setEditFiliereData] = useState({ nom: "" })

  const [editingNiveau, setEditingNiveau] = useState<Niveau | null>(null)
  const [editNiveauData, setEditNiveauData] = useState({ nom: "" })

  const [editingSemestre, setEditingSemestre] = useState<Semestre | null>(null)
  const [editSemestreData, setEditSemestreData] = useState({ nom: "" })

  const [editingUE, setEditingUE] = useState<UE | null>(null)
  const [editUEData, setEditUEData] = useState({ intitule: "" })

  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editModuleData, setEditModuleData] = useState({ nom: "", credit: "" })

  const [editingEtudiant, setEditingEtudiant] = useState<string | null>(null)
  const [editingProfesseur, setEditingProfesseur] = useState<string | null>(null)
  const [editEtudiantData, setEditEtudiantData] = useState({ nom: "", email: "" })
  const [editProfesseurData, setEditProfesseurData] = useState({ nom: "", email: "" })

  useEffect(() => {
    fetchUserData()
    fetchAllData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/me", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        setFaculteData((prev) => ({
          ...prev,
          universiteId: data.user.universiteId || "",
        }))
        console.log("[v0] Données admin récupérées:", data.user)
      }
    } catch (error) {
      console.error("[v0] Erreur récupération données admin:", error)
    }
  }

  const fetchAllData = async () => {
    try {
      console.log("[v0] Récupération des données depuis l'API...")
      const [
        etudiantsRes,
        professeursRes,
        semestresRes,
        uesRes,
        facultesRes,
        filieresRes,
        niveauxRes,
        modulesRes,
        notesRes,
      ] = await Promise.all([
        fetch("http://localhost:4000/api/etudiants", { credentials: "include" }),
        fetch("http://localhost:4000/api/professeurs", { credentials: "include" }),
        fetch("http://localhost:4000/api/semestres", { credentials: "include" }),
        fetch("http://localhost:4000/api/ues", { credentials: "include" }),
        fetch("http://localhost:4000/api/facultes", { credentials: "include" }),
        fetch("http://localhost:4000/api/filieres", { credentials: "include" }),
        fetch("http://localhost:4000/api/niveaux", { credentials: "include" }),
        fetch("http://localhost:4000/api/modules", { credentials: "include" }),
        fetch("http://localhost:4000/api/notes", { credentials: "include" }),
      ])

      if (etudiantsRes.ok) {
        const data = await etudiantsRes.json()
        console.log("[v0] Étudiants récupérés:", data.length)
        setEtudiants(data)
      } else {
        console.log("[v0] Erreur étudiants:", etudiantsRes.status)
      }

      if (professeursRes.ok) {
        const data = await professeursRes.json()
        console.log("[v0] Professeurs récupérés:", data.length)
        setProfesseurs(data)
      } else {
        console.log("[v0] Erreur professeurs:", professeursRes.status)
      }

      if (semestresRes.ok) {
        const data = await semestresRes.json()
        console.log("[v0] Semestres récupérés:", data.length)
        setSemestres(data)
      } else {
        console.log("[v0] Erreur semestres:", semestresRes.status)
      }

      if (uesRes.ok) {
        const data = await uesRes.json()
        console.log("[v0] UE récupérées:", data.length)
        setUes(data)
      } else {
        console.log("[v0] Erreur UE:", uesRes.status)
      }

      if (facultesRes.ok) {
        const data = await facultesRes.json()
        console.log("[v0] Facultés récupérées:", data.length)
        setFacultes(data)
      } else {
        console.log("[v0] Erreur facultés:", facultesRes.status)
      }

      if (filieresRes.ok) {
        const data = await filieresRes.json()
        console.log("[v0] Filières récupérées:", data.length)
        setFilieres(data)
      } else {
        console.log("[v0] Erreur filières:", filieresRes.status)
      }

      if (niveauxRes.ok) {
        const data = await niveauxRes.json()
        console.log("[v0] Niveaux récupérés:", data.length)
        setNiveaux(data)
      } else {
        console.log("[v0] Erreur niveaux:", niveauxRes.status)
      }

      if (modulesRes.ok) {
        const data = await modulesRes.json()
        console.log("[v0] Modules récupérés:", data.length)
        setModules(data)
      } else {
        console.log("[v0] Erreur modules:", modulesRes.status)
      }

      if (notesRes.ok) {
        const data = await notesRes.json()
        console.log("[v0] Notes récupérées:", data.length)
        setNotes(data)
      } else {
        console.log("[v0] Erreur notes:", notesRes.status)
      }
    } catch (err) {
      console.error("[v0] Erreur lors du chargement des données:", err)
      setError("Erreur lors du chargement des données")
    }
  }

  const handleCreateEtudiant = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("[v0] Données étudiant envoyées:", {
        ...etudiantData,
        niveauId: Number(etudiantData.niveauId),
        universiteId: userData?.universiteId || 1,
      })

      const response = await fetch("http://localhost:4000/api/etudiants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...etudiantData,
          niveauId: Number(etudiantData.niveauId),
          universiteId: userData?.universiteId || 1, // Utilisation de l'universiteId de l'admin
        }),
      })

      console.log("[v0] Statut de la réponse:", response.status)
      console.log("[v0] Headers de la réponse:", response.headers)

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.log("[v0] Réponse non-JSON reçue:", textResponse)
        setError(
          `Erreur serveur: L'endpoint retourne du HTML au lieu de JSON. Vérifiez que l'endpoint /api/admin/etudiants existe.`,
        )
        return
      }

      const data = await response.json()
      console.log("[v0] Données reçues:", data)

      if (response.ok) {
        setMessage(`Étudiant créé avec succès. Code: ${data.etudiant.code}. Email envoyé.`)
        setEtudiantData({ nom: "", email: "", motDePasse: "", niveauId: "" })
        fetchAllData()
      } else {
        setError(data.message || `Erreur ${response.status}: ${data.error || "Erreur inconnue"}`)
      }
    } catch (err) {
      console.log("[v0] Erreur complète:", err)
      setError(`Erreur lors de la création de l'étudiant: ${err instanceof Error ? err.message : "Erreur inconnue"}`)
    }
  }

  const handleCreateProfesseur = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("[v0] Données professeur envoyées:", {
        ...professeurData,
        universiteId: userData?.user?.universiteId || 1,
      })

      const response = await fetch("http://localhost:4000/api/professeurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...professeurData,
          universiteId: userData?.user?.universiteId || 1,
        }),
      })

      console.log("[v0] Statut réponse:", response.status)
      const data = await response.json()
      console.log("[v0] Réponse API:", data)

      if (response.ok) {
        setMessage(`Professeur créé avec succès. Code: ${data.professeur.code}. Email envoyé.`)
        setProfesseurData({ nom: "", email: "", motDePasse: "", modulesIds: [] })
        await fetchAllData()
      } else {
        setError(data.message)
      }
    } catch (err: any) {
      console.error("[v0] Erreur création professeur:", err)
      setError(`Erreur lors de la création du professeur: ${err.message}`)
    }
  }

  const handleCreateSemestre = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("[v0] Données envoyées pour semestre:", semestreData)

      const response = await fetch("http://localhost:4000/api/semestres", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(semestreData),
      })

      console.log("[v0] Statut de la réponse:", response.status)
      console.log("[v0] Headers de la réponse:", response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Erreur du serveur:", errorText)

        if (errorText.includes("<!DOCTYPE")) {
          throw new Error("L'endpoint /api/admin/semestres n'existe pas sur le serveur")
        }

        throw new Error(`Erreur ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] Semestre créé avec succès:", result)

      await fetchAllData()

      setSemestreData({ nom: "", niveauId: "" })
      setSuccess("Semestre créé avec succès")
    } catch (err: any) {
      console.error("[v0] Erreur lors de la création du semestre:", err)
      setError(`Erreur lors de la création du semestre: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUE = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("[v0] Données UE envoyées:", ueData)

      const response = await fetch("http://localhost:4000/api/ues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          intitule: ueData.intitule, // Utilisation d'intitule
          credits: ueData.credits,
          semestreId: Number.parseInt(ueData.semestreId),
        }),
      })

      console.log("[v0] Statut réponse:", response.status)
      const data = await response.json()
      console.log("[v0] Réponse API:", data)

      if (response.ok) {
        setMessage(`UE créée avec succès. Code: ${data.code}`)
        setUeData({ intitule: "", credits: 0, semestreId: "" })
        await fetchAllData()
      } else {
        setError(data.message)
      }
    } catch (err: any) {
      console.error("[v0] Erreur création UE:", err)
      setError(`Erreur lors de la création de l'UE: ${err.message}`)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:4000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(noteData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (errorText.includes("<!DOCTYPE")) {
          throw new Error("L'endpoint /api/admin/notes n'existe pas sur le serveur")
        }
        throw new Error(`Erreur ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      await fetchAllData()

      setNoteData({ etudiantId: "", moduleId: "", note: "" })
      setSuccess("Note enregistrée avec succès - Moyennes calculées automatiquement")
    } catch (err: any) {
      setError(`Erreur lors de l'enregistrement de la note: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFaculte = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!faculteData.universiteId) {
      setMessage("Erreur: ID université non disponible")
      return
    }

    try {
      console.log("[v0] Tentative de création de faculté:", {
        nom: faculteData.nom,
        universiteId: Number(faculteData.universiteId),
        adminUniversiteId: userData?.universiteId, // Debug
      })

      const response = await fetch("http://localhost:4000/api/facultes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nom: faculteData.nom,
          universiteId: Number(faculteData.universiteId),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Données de succès:", data)
        setMessage("Faculté créée avec succès")
        setFaculteData({
          nom: "",
          universiteId: userData?.universiteId || "",
        })
        fetchAllData()
      } else {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json()
          console.log("[v0] Données d'erreur JSON:", data)
          setError(data.message || `Erreur ${response.status}: ${response.statusText}`)
        } else {
          const text = await response.text()
          console.log("[v0] Réponse HTML d'erreur:", text.substring(0, 200))
          setError(
            `Endpoint non trouvé (${response.status}). Vérifiez que l'API /api/admin/facultes existe sur votre serveur.`,
          )
        }
      }
    } catch (err) {
      console.log("[v0] Erreur dans le catch:", err)
      setError(`Erreur de connexion: ${err}. Vérifiez que le serveur est démarré sur le port 4000.`)
    }
  }

  const handleCreateFiliere = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/api/filieres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nom: filiereData.nom,
          faculteId: Number(filiereData.faculteId),
        }),
      })

      if (response.ok) {
        setMessage("Filière créée avec succès")
        setFiliereData({ nom: "", faculteId: "" })
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message)
      }
    } catch (err) {
      setError("Erreur lors de la création de la filière")
    }
  }

  const handleCreateNiveau = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/api/niveaux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nom: niveauData.nom,
          filiereId: Number(niveauData.filiereId),
        }),
      })

      if (response.ok) {
        setMessage("Niveau créé avec succès")
        setNiveauData({ nom: "", filiereId: "" })
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message)
      }
    } catch (err) {
      setError("Erreur lors de la création du niveau")
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:4000/api/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(moduleData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (errorText.includes("<!DOCTYPE")) {
          throw new Error("L'endpoint /api/modules n'existe pas sur le serveur")
        }
        throw new Error(`Erreur ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      await fetchAllData()

      setModuleData({ nom: "", credit: "", ueId: "", niveauId: "", professeurId: "" })
      setSuccess("Module créé avec succès")
    } catch (err: any) {
      setError(`Erreur lors de la création du module: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFaculte = async (faculteId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette faculté ?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:4000/api/facultes/${faculteId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setMessage("Faculté supprimée avec succès")
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("[v0] Erreur suppression faculté:", error)
      setError("Erreur lors de la suppression de la faculté")
    }
  }

  const handleEditFaculte = (faculte: Faculte) => {
    setEditingFaculte(faculte)
    setEditFaculteData({ nom: faculte.nom })
  }

  const handleUpdateFaculte = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingFaculte) return

    try {
      const response = await fetch(`http://localhost:4000/api/facultes/${editingFaculte.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nom: editFaculteData.nom,
        }),
      })

      if (response.ok) {
        setMessage("Faculté modifiée avec succès")
        setEditingFaculte(null)
        setEditFaculteData({ nom: "" })
        await fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la modification")
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`)
    }
  }

  const cancelEditFaculte = () => {
    setEditingFaculte(null)
    setEditFaculteData({ nom: "" })
  }

  const handleDeleteFiliere = async (filiereId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette filière ?")) return

    try {
      const response = await fetch(`http://localhost:4000/api/filieres/${filiereId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setMessage("Filière supprimée avec succès")
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      setError("Erreur lors de la suppression de la filière")
    }
  }

  const handleEditFiliere = (filiere: Filiere) => {
    setEditingFiliere(filiere)
    setEditFiliereData({ nom: filiere.nom })
  }

  const handleUpdateFiliere = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFiliere) return

    try {
      const response = await fetch(`http://localhost:4000/api/filieres/${editingFiliere.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nom: editFiliereData.nom }),
      })

      if (response.ok) {
        setMessage("Filière modifiée avec succès")
        setEditingFiliere(null)
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la modification")
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`)
    }
  }

  const cancelEditFiliere = () => {
    setEditingFiliere(null)
    setEditFiliereData({ nom: "" })
  }

  const handleDeleteNiveau = async (niveauId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce niveau ?")) return

    try {
      const response = await fetch(`http://localhost:4000/api/niveaux/${niveauId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setMessage("Niveau supprimé avec succès")
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      setError("Erreur lors de la suppression du niveau")
    }
  }

  const handleEditNiveau = (niveau: Niveau) => {
    setEditingNiveau(niveau)
    setEditNiveauData({ nom: niveau.nom })
  }

  const handleUpdateNiveau = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNiveau) return

    try {
      const response = await fetch(`http://localhost:4000/api/niveaux/${editingNiveau.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nom: editNiveauData.nom }),
      })

      if (response.ok) {
        setMessage("Niveau modifié avec succès")
        setEditingNiveau(null)
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la modification")
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`)
    }
  }

  const cancelEditNiveau = () => {
    setEditingNiveau(null)
    setEditNiveauData({ nom: "" })
  }

  const handleDeleteSemestre = async (semestreId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce semestre ?")) return

    try {
      const response = await fetch(`http://localhost:4000/api/semestres/${semestreId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setMessage("Semestre supprimé avec succès")
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      setError("Erreur lors de la suppression du semestre")
    }
  }

  const handleEditSemestre = (semestre: Semestre) => {
    setEditingSemestre(semestre)
    setEditSemestreData({ nom: semestre.nom })
  }

  const handleUpdateSemestre = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSemestre) return

    try {
      const response = await fetch(`http://localhost:4000/api/semestres/${editingSemestre.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nom: editSemestreData.nom }),
      })

      if (response.ok) {
        setMessage("Semestre modifié avec succès")
        setEditingSemestre(null)
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la modification")
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`)
    }
  }

  const cancelEditSemestre = () => {
    setEditingSemestre(null)
    setEditSemestreData({ nom: "" })
  }

  const handleDeleteUE = async (ueId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette UE ?")) return

    try {
      const response = await fetch(`http://localhost:4000/api/ues/${ueId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setMessage("UE supprimée avec succès")
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      setError("Erreur lors de la suppression de l'UE")
    }
  }

  const handleEditUE = (ue: UE) => {
    setEditingUE(ue)
    setEditUEData({ intitule: ue.intitule })
  }

  const handleUpdateUE = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUE) return

    try {
      const response = await fetch(`http://localhost:4000/api/ues/${editingUE.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ intitule: editUEData.intitule }),
      })

      if (response.ok) {
        setMessage("UE modifiée avec succès")
        setEditingUE(null)
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la modification")
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`)
    }
  }

  const cancelEditUE = () => {
    setEditingUE(null)
    setEditUEData({ intitule: "" })
  }

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) return

    try {
      const response = await fetch(`http://localhost:4000/api/modules/${moduleId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setMessage("Module supprimé avec succès")
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      setError("Erreur lors de la suppression du module")
    }
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setEditModuleData({ nom: module.nom, credit: module.credit.toString() })
  }

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingModule) return

    try {
      const response = await fetch(`http://localhost:4000/api/modules/${editingModule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nom: editModuleData.nom,
          credit: Number(editModuleData.credit),
        }),
      })

      if (response.ok) {
        setMessage("Module modifié avec succès")
        setEditingModule(null)
        fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la modification")
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`)
    }
  }

  const cancelEditModule = () => {
    setEditingModule(null)
    setEditModuleData({ nom: "", credit: "" })
  }

  const handleDeleteEtudiant = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) return

    try {
      const response = await fetch(`http://localhost:4000/api/etudiants/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setSuccess("Étudiant supprimé avec succès")
        await fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      setError("Erreur lors de la suppression de l'étudiant")
    }
  }

  const handleEditEtudiant = (etudiant: Etudiant) => {
    setEditingEtudiant(etudiant.id)
    setEditEtudiantData({ nom: etudiant.nom, email: etudiant.email })
  }

  const handleSaveEtudiant = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/etudiants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editEtudiantData),
      })

      if (response.ok) {
        setSuccess("Étudiant modifié avec succès")
        setEditingEtudiant(null)
        await fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la modification")
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`)
    }
  }

  const handleCancelEditEtudiant = () => {
    setEditingEtudiant(null)
    setEditEtudiantData({ nom: "", email: "" })
  }

  const handleDeleteProfesseur = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce professeur ?")) return

    try {
      console.log("[v0] Suppression professeur ID:", id)
      const response = await fetch(`http://localhost:4000/api/professeurs/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      console.log("[v0] Statut réponse suppression:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Suppression réussie:", data)
        setSuccess("Professeur supprimé avec succès")
        await fetchAllData()
      } else {
        const errorText = await response.text()
        console.log("[v0] Erreur suppression:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          setError(errorData.message || "Erreur lors de la suppression")
        } catch {
          setError(`Erreur ${response.status}: ${errorText}`)
        }
      }
    } catch (err) {
      console.error("[v0] Erreur réseau suppression professeur:", err)
      setError("Erreur lors de la suppression du professeur")
    }
  }

  const handleEditProfesseur = (professeur: Professeur) => {
    setEditingProfesseur(professeur.id)
    setEditProfesseurData({ nom: professeur.nom, email: professeur.email })
  }

  const handleSaveProfesseur = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/professeurs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editProfesseurData),
      })

      if (response.ok) {
        setSuccess("Professeur modifié avec succès")
        setEditingProfesseur(null)
        await fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la modification")
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`)
    }
  }

  const handleCancelEditProfesseur = () => {
    setEditingProfesseur(null)
    setEditProfesseurData({ nom: "", email: "" })
  }

  const handleUpdateProfesseurModules = async (professeurId: string, modulesIds: number[]) => {
    try {
      const response = await fetch("http://localhost:4000/api/admin/professeurs/modules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ professeurId, modulesIds }),
      })

      if (response.ok) {
        setSuccess("Modules du professeur mis à jour avec succès")
        await fetchAllData()
      } else {
        const data = await response.json()
        setError(data.message || "Erreur lors de la mise à jour des modules")
      }
    } catch (err: any) {
      setError(`Erreur: ${err.message}`)
    }
  }

  const getFilieresForFaculte = (faculteId: number) => {
    return filieres.filter((filiere) => filiere.faculteId === faculteId)
  }

  const getNiveauxForFiliere = (filiereId: number) => {
    return niveaux.filter((niveau) => niveau.filiereId === filiereId)
  }

  return (
    <DashboardLayout title="Administration Universitaire">
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

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="etudiants">Étudiants</TabsTrigger>
            <TabsTrigger value="professeurs">Professeurs</TabsTrigger>
            <TabsTrigger value="semestres">Semestres</TabsTrigger>
            <TabsTrigger value="ues">UE</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          </TabsList>

          <TabsContent value="structure">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gestion des Facultés */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    Facultés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateFaculte} className="space-y-4 mb-4">
                    <div>
                      <Label htmlFor="faculteNom">Nom de la faculté</Label>
                      <Input
                        id="faculteNom"
                        value={faculteData.nom}
                        onChange={(e) => setFaculteData({ ...faculteData, nom: e.target.value })}
                        placeholder="ex: Faculté des Sciences"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer la faculté
                    </Button>
                  </form>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {facultes.map((faculte) => (
                      <div key={faculte.id} className="p-2 border rounded bg-card">
                        {editingFaculte?.id === faculte.id ? (
                          <form onSubmit={handleUpdateFaculte} className="space-y-2">
                            <Input
                              value={editFaculteData.nom}
                              onChange={(e) => setEditFaculteData({ nom: e.target.value })}
                              placeholder="Nom de la faculté"
                              required
                            />
                            <div className="flex gap-2">
                              <Button type="submit" size="sm" className="flex-1">
                                Sauvegarder
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={cancelEditFaculte}
                                className="flex-1 bg-transparent"
                              >
                                Annuler
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{faculte.nom}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {getFilieresForFaculte(faculte.id).length} filière(s)
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditFaculte(faculte)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFaculte(faculte.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gestion des Filières */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <School className="mr-2 h-5 w-5" />
                    Filières
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateFiliere} className="space-y-4 mb-4">
                    <div>
                      <Label htmlFor="filiereNom">Nom de la filière</Label>
                      <Input
                        id="filiereNom"
                        value={filiereData.nom}
                        onChange={(e) => setFiliereData({ ...filiereData, nom: e.target.value })}
                        placeholder="ex: Informatique"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="filiereFaculte">Faculté</Label>
                      <select
                        id="filiereFaculte"
                        className="w-full p-2 border rounded-md bg-input"
                        value={filiereData.faculteId}
                        onChange={(e) => setFiliereData({ ...filiereData, faculteId: e.target.value })}
                        required
                      >
                        <option value="">Sélectionner une faculté</option>
                        {facultes.map((faculte) => (
                          <option key={faculte.id} value={faculte.id}>
                            {faculte.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer la filière
                    </Button>
                  </form>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filieres.map((filiere) => (
                      <div key={filiere.id} className="p-2 border rounded bg-card">
                        {editingFiliere?.id === filiere.id ? (
                          <form onSubmit={handleUpdateFiliere} className="space-y-2">
                            <Input
                              value={editFiliereData.nom}
                              onChange={(e) => setEditFiliereData({ nom: e.target.value })}
                              placeholder="Nom de la filière"
                              required
                            />
                            <div className="flex gap-2">
                              <Button type="submit" size="sm" className="flex-1">
                                Sauvegarder
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={cancelEditFiliere}
                                className="flex-1 bg-transparent"
                              >
                                Annuler
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{filiere.nom}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {getNiveauxForFiliere(filiere.id).length} niveau(x)
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditFiliere(filiere)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFiliere(filiere.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gestion des Niveaux */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="mr-2 h-5 w-5" />
                    Niveaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateNiveau} className="space-y-4 mb-4">
                    <div>
                      <Label htmlFor="niveauNom">Nom du niveau</Label>
                      <Input
                        id="niveauNom"
                        value={niveauData.nom}
                        onChange={(e) => setNiveauData({ ...niveauData, nom: e.target.value })}
                        placeholder="ex: Licence 1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="niveauFiliere">Filière</Label>
                      <select
                        id="niveauFiliere"
                        className="w-full p-2 border rounded-md bg-input"
                        value={niveauData.filiereId}
                        onChange={(e) => setNiveauData({ ...niveauData, filiereId: e.target.value })}
                        required
                      >
                        <option value="">Sélectionner une filière</option>
                        {filieres.map((filiere) => (
                          <option key={filiere.id} value={filiere.id}>
                            {filiere.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer le niveau
                    </Button>
                  </form>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {niveaux.map((niveau) => (
                      <div key={niveau.id} className="p-2 border rounded bg-card">
                        {editingNiveau?.id === niveau.id ? (
                          <form onSubmit={handleUpdateNiveau} className="space-y-2">
                            <Input
                              value={editNiveauData.nom}
                              onChange={(e) => setEditNiveauData({ nom: e.target.value })}
                              placeholder="Nom du niveau"
                              required
                            />
                            <div className="flex gap-2">
                              <Button type="submit" size="sm" className="flex-1">
                                Sauvegarder
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={cancelEditNiveau}
                                className="flex-1 bg-transparent"
                              >
                                Annuler
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{niveau.nom}</h4>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditNiveau(niveau)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteNiveau(niveau.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Vue d'ensemble hiérarchique */}
              <Card>
                <CardHeader>
                  <CardTitle>Vue d'ensemble de la structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {facultes.map((faculte) => (
                      <div key={faculte.id} className="border rounded-lg p-3">
                        <h4 className="font-semibold text-primary">{faculte.nom}</h4>
                        {getFilieresForFaculte(faculte.id).map((filiere) => (
                          <div key={filiere.id} className="ml-4 mt-2">
                            <h5 className="font-medium text-secondary-foreground">📚 {filiere.nom}</h5>
                            {getNiveauxForFiliere(filiere.id).map((niveau) => (
                              <div key={niveau.id} className="ml-4 text-sm text-muted-foreground">
                                📖 {niveau.nom}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="etudiants">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Gestion des Étudiants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEtudiant} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="etudiantNom">Nom complet</Label>
                      <Input
                        id="etudiantNom"
                        value={etudiantData.nom}
                        onChange={(e) => setEtudiantData({ ...etudiantData, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="etudiantEmail">Email</Label>
                      <Input
                        id="etudiantEmail"
                        type="email"
                        value={etudiantData.email}
                        onChange={(e) => setEtudiantData({ ...etudiantData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="etudiantPassword">Mot de passe</Label>
                      <Input
                        id="etudiantPassword"
                        type="password"
                        value={etudiantData.motDePasse}
                        onChange={(e) => setEtudiantData({ ...etudiantData, motDePasse: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="etudiantNiveau">Niveau</Label>
                      <select
                        id="etudiantNiveau"
                        className="w-full p-2 border rounded-md bg-input"
                        value={etudiantData.niveauId}
                        onChange={(e) => setEtudiantData({ ...etudiantData, niveauId: e.target.value })}
                        required
                      >
                        <option value="">Sélectionner un niveau</option>
                        {niveaux.map((niveau) => (
                          <option key={niveau.id} value={niveau.id}>
                            {niveau.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer l'étudiant (Code auto-généré)
                  </Button>
                </form>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Étudiants inscrits ({etudiants.length})</h3>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {etudiants.map((etudiant) => (
                      <div key={etudiant.id} className="p-3 border rounded-lg bg-card">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            {editingEtudiant === etudiant.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editEtudiantData.nom}
                                  onChange={(e) => setEditEtudiantData({ ...editEtudiantData, nom: e.target.value })}
                                  placeholder="Nom"
                                />
                                <Input
                                  value={editEtudiantData.email}
                                  onChange={(e) => setEditEtudiantData({ ...editEtudiantData, email: e.target.value })}
                                  placeholder="Email"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSaveEtudiant(etudiant.id)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEditEtudiant}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <h4 className="font-medium">{etudiant.nom}</h4>
                                <p className="text-sm text-muted-foreground">{etudiant.email}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="font-mono text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                                {etudiant.code}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{etudiant.niveau?.nom}</p>
                            </div>
                            {editingEtudiant !== etudiant.id && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleEditEtudiant(etudiant)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteEtudiant(etudiant.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professeurs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Gestion des Professeurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProfesseur} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="professeurNom">Nom complet</Label>
                      <Input
                        id="professeurNom"
                        value={professeurData.nom}
                        onChange={(e) => setProfesseurData({ ...professeurData, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="professeurEmail">Email</Label>
                      <Input
                        id="professeurEmail"
                        type="email"
                        value={professeurData.email}
                        onChange={(e) => setProfesseurData({ ...professeurData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="professeurPassword">Mot de passe</Label>
                      <Input
                        id="professeurPassword"
                        type="password"
                        value={professeurData.motDePasse}
                        onChange={(e) => setProfesseurData({ ...professeurData, motDePasse: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Modules assignés (optionnel)</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                        {modules.map((module) => (
                          <label key={module.id} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={professeurData.modulesIds.includes(module.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProfesseurData({
                                    ...professeurData,
                                    modulesIds: [...professeurData.modulesIds, module.id],
                                  })
                                } else {
                                  setProfesseurData({
                                    ...professeurData,
                                    modulesIds: professeurData.modulesIds.filter((id) => id !== module.id),
                                  })
                                }
                              }}
                            />
                            <span>{module.nom}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer le professeur (Code auto-généré)
                  </Button>
                </form>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Professeurs ({professeurs.length})</h3>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {professeurs.map((professeur) => (
                      <div key={professeur.id} className="p-3 border rounded-lg bg-card">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            {editingProfesseur === professeur.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={editProfesseurData.nom}
                                  onChange={(e) =>
                                    setEditProfesseurData({ ...editProfesseurData, nom: e.target.value })
                                  }
                                  placeholder="Nom"
                                />
                                <Input
                                  value={editProfesseurData.email}
                                  onChange={(e) =>
                                    setEditProfesseurData({ ...editProfesseurData, email: e.target.value })
                                  }
                                  placeholder="Email"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSaveProfesseur(professeur.id)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEditProfesseur}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <h4 className="font-medium">{professeur.nom}</h4>
                                <p className="text-sm text-muted-foreground">{professeur.email}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                              {professeur.code}
                            </p>
                            {editingProfesseur !== professeur.id && (
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleEditProfesseur(professeur)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteProfesseur(professeur.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semestres">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Gestion des Semestres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSemestre} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="semestreNom">Nom du semestre</Label>
                      <Input
                        id="semestreNom"
                        value={semestreData.nom}
                        onChange={(e) => setSemestreData({ ...semestreData, nom: e.target.value })}
                        placeholder="ex: Semestre 1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="semestreNiveau">Niveau</Label>
                      <select
                        id="semestreNiveau"
                        className="w-full p-2 border rounded-md bg-input"
                        value={semestreData.niveauId}
                        onChange={(e) => setSemestreData({ ...semestreData, niveauId: e.target.value })}
                        required
                      >
                        <option value="">Sélectionner un niveau</option>
                        {niveaux.map((niveau) => (
                          <option key={niveau.id} value={niveau.id}>
                            {niveau.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer le semestre
                  </Button>
                </form>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center justify-between">
                    Semestres ({semestres.length})
                    <span className="text-sm font-normal text-muted-foreground">
                      {semestres.length > 0 ? "Mis à jour automatiquement" : "Aucun semestre"}
                    </span>
                  </h3>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Semestres récupérés depuis l'API ({semestres.length})
                    </h4>
                    {semestres.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Aucun semestre trouvé. Vérifiez que l'endpoint /api/semestres fonctionne.
                      </p>
                    ) : (
                      semestres.map((semestre) => (
                        <div key={semestre.id} className="p-2 border rounded bg-card">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{semestre.nom}</h4>
                              <p className="text-xs text-muted-foreground">
                                Niveau: {semestre.niveauId} | Crédits: {semestre.credits || "N/A"}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleEditSemestre(semestre)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteSemestre(semestre.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ues">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Gestion des UE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUE} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ueIntitule">Intitulé de l'UE</Label>
                      <Input
                        id="ueIntitule"
                        value={ueData.intitule}
                        onChange={(e) => setUeData({ ...ueData, intitule: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ueCredits">Crédits</Label>
                      <Input
                        id="ueCredits"
                        type="number"
                        min="1"
                        max="30"
                        value={ueData.credits}
                        onChange={(e) => setUeData({ ...ueData, credits: Number.parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="ueSemestre">Semestre</Label>
                      <select
                        id="ueSemestre"
                        value={ueData.semestreId}
                        onChange={(e) => setUeData({ ...ueData, semestreId: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">Sélectionner un semestre</option>
                        {semestres.map((semestre) => (
                          <option key={semestre.id} value={semestre.id}>
                            {semestre.nom} {semestre.niveau?.nom && `(${semestre.niveau.nom})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer l'UE (Code auto-généré)
                  </Button>
                </form>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">UE ({ues.length})</h3>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {ues.map((ue) => (
                      <div key={ue.id} className="p-3 border rounded-lg bg-card">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-medium">{ue.intitule}</h4>
                            <p className="text-sm text-muted-foreground">
                              Code: {ue.code} | Crédits: {ue.credits || "Non défini"}
                              {ue.semestre?.nom && ` | Semestre: ${ue.semestre.nom}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditUE(ue)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteUE(ue.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Gestion des Modules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateModule} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="moduleNom">Nom du module</Label>
                      <Input
                        id="moduleNom"
                        value={moduleData.nom}
                        onChange={(e) => setModuleData({ ...moduleData, nom: e.target.value })}
                        placeholder="ex: Algorithmique"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="moduleCredit">Crédits</Label>
                      <Input
                        id="moduleCredit"
                        type="number"
                        min="1"
                        max="10"
                        value={moduleData.credit}
                        onChange={(e) => setModuleData({ ...moduleData, credit: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="moduleNiveau">Niveau</Label>
                      <select
                        id="moduleNiveau"
                        className="w-full p-2 border rounded-md bg-input"
                        value={moduleData.niveauId}
                        onChange={(e) => setModuleData({ ...moduleData, niveauId: e.target.value })}
                        required
                      >
                        <option value="">Sélectionner un niveau</option>
                        {niveaux.map((niveau) => (
                          <option key={niveau.id} value={niveau.id}>
                            {niveau.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="moduleUE">UE</Label>
                      <select
                        id="moduleUE"
                        className="w-full p-2 border rounded-md bg-input"
                        value={moduleData.ueId}
                        onChange={(e) => setModuleData({ ...moduleData, ueId: e.target.value })}
                        required
                      >
                        <option value="">Sélectionner une UE</option>
                        {ues.map((ue) => (
                          <option key={ue.id} value={ue.id}>
                            {ue.intitule} ({ue.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer le module
                  </Button>
                </form>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center justify-between">
                    Modules ({modules.length})
                    <span className="text-sm font-normal text-muted-foreground">
                      {modules.length > 0 ? "Mis à jour automatiquement" : "Aucun module"}
                    </span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Modules récupérés depuis l'API ({modules.length})
                    </h4>
                    {modules.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Aucun module trouvé. Vérifiez que l'endpoint /api/modules fonctionne.
                      </p>
                    ) : (
                      modules.map((module) => (
                        <div key={module.id} className="p-2 border rounded bg-card">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{module.nom}</h4>
                              <p className="text-xs text-muted-foreground">
                                Code: {module.code} | UE: {module.ueId} | Prof: {module.professeurId || "Non assigné"}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleEditModule(module)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteModule(module.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Gestion des Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddNote} className="space-y-4 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="noteEtudiant">Étudiant</Label>
                      <select
                        id="noteEtudiant"
                        className="w-full p-2 border rounded-md bg-input"
                        value={noteData.etudiantId}
                        onChange={(e) => setNoteData({ ...noteData, etudiantId: e.target.value })}
                        required
                      >
                        <option value="">Sélectionner un étudiant</option>
                        {etudiants.map((etudiant) => (
                          <option key={etudiant.id} value={etudiant.id}>
                            {etudiant.nom} ({etudiant.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="noteModule">Module</Label>
                      <select
                        id="noteModule"
                        className="w-full p-2 border rounded-md bg-input"
                        value={noteData.moduleId}
                        onChange={(e) => setNoteData({ ...noteData, moduleId: e.target.value })}
                        required
                      >
                        <option value="">Sélectionner un module</option>
                        {modules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.nom} ({module.ue?.intitule})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="noteValeur">Note (/20)</Label>
                      <Input
                        id="noteValeur"
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={noteData.note}
                        onChange={(e) => setNoteData({ ...noteData, note: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Enregistrer la note (Calcul automatique des moyennes)
                  </Button>
                </form>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Calcul automatique des moyennes</h4>
                  <p className="text-sm text-blue-800">
                    Lorsque vous ajoutez une note à un module, le système calcule automatiquement :
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc">
                    <li>La moyenne de l'UE (quand toutes les notes des modules sont disponibles)</li>
                    <li>La moyenne du semestre (quand toutes les UE sont validées)</li>
                  </ul>
                </div>

                <div className="space-y-2 mt-6">
                  <h3 className="text-lg font-medium flex items-center justify-between">
                    Notes récentes ({notes.length})
                    <span className="text-sm font-normal text-muted-foreground">
                      {notes.length > 0 ? "10 dernières notes" : "Aucune note"}
                    </span>
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Notes récupérées depuis l'API ({notes.length})
                    </h4>
                    {notes.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        Aucune note trouvée. Vérifiez que l'endpoint /api/notes fonctionne.
                      </p>
                    ) : (
                      notes.slice(0, 10).map((note, index) => (
                        <div key={index} className="p-2 border rounded bg-card">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">
                                Note: {note.note}/20
                                <span
                                  className={`ml-2 px-2 py-1 rounded text-xs ${
                                    note.note >= 10 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {note.note >= 10 ? "Validé" : "Non validé"}
                                </span>
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Étudiant: {note.etudiantId} | Module: {note.moduleId} | Date:{" "}
                                {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {notes.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center">
                        ... et {notes.length - 10} autres notes
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Facultés</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{facultes.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Filières</CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filieres.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Niveaux</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{niveaux.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Modules</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{modules.length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
