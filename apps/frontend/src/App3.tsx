import { useEffect, useState } from "react"
import type { Course, CourseWorkWithSubmission, SubmissionAttachmentItem } from "shared"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// ✅ BASE URL DARI ENV
const BASE_URL = import.meta.env.VITE_BACKEND_URL

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDueDate(dueDate?: { year: number; month: number; day: number }) {
  if (!dueDate) return "Tidak ada deadline"
  return new Date(dueDate.year, dueDate.month - 1, dueDate.day).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function stateLabel(state?: string) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    TURNED_IN: { label: "Dikumpulkan", variant: "default" },
    RETURNED: { label: "Dinilai", variant: "secondary" },
    CREATED: { label: "Belum Dikumpulkan", variant: "destructive" },
    NEW: { label: "Belum Dimulai", variant: "outline" },
    RECLAIMED_BY_STUDENT: { label: "Ditarik Kembali", variant: "outline" },
  }
  return map[state ?? ""] ?? { label: state ?? "–", variant: "outline" }
}


// ─────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────

function CourseWorkCard({ item }: { item: CourseWorkWithSubmission }) {
  const { courseWork, submission } = item
  const { label, variant } = stateLabel(submission?.state)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{courseWork.title}</CardTitle>
        <Badge variant={variant}>{label}</Badge>
        <CardDescription>{formatDueDate(courseWork.dueDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        {courseWork.description}
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [items, setItems] = useState<CourseWorkWithSubmission[]>([])

  // ✅ cek login
  useEffect(() => {
    fetch(`${BASE_URL}/auth/me`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setLoggedIn(d.loggedIn))
      .catch(() => setLoggedIn(false))
  }, [])

  // ✅ load courses
  useEffect(() => {
    if (!loggedIn) return
    fetch(`${BASE_URL}/classroom/courses`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setCourses(d.data ?? []))
  }, [loggedIn])

  const loadSubmissions = async (courseId: string) => {
    const res = await fetch(
      `${BASE_URL}/classroom/courses/${courseId}/submissions`,
      { credentials: "include" }
    )
    const d = await res.json()
    setItems(d.data ?? [])
  }

  const handleLogin = () => {
    window.location.href = `${BASE_URL}/auth/login`
  }

  const handleLogout = async () => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    setLoggedIn(false)
  }

  if (loggedIn === null) return <p>Loading...</p>

  if (!loggedIn) {
    return (
      <div>
        <h1>Login</h1>
        <Button onClick={handleLogin}>Login Google</Button>
      </div>
    )
  }

  return (
    <div>
      <h1>Classroom</h1>
      <Button onClick={handleLogout}>Logout</Button>

      {/* Courses */}
      <div style={{ marginTop: "10px" }}>
        {courses.map((c) => (
          <Button key={c.id} onClick={() => loadSubmissions(c.id)}>
            {c.name}
          </Button>
        ))}
      </div>

      {/* Coursework */}
      <div style={{ marginTop: "20px" }}>
        {items.map((item) => (
          <CourseWorkCard key={item.courseWork.id} item={item} />
        ))}
      </div>
    </div>
  )
}