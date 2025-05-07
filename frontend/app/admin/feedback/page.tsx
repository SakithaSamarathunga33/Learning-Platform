"use client";

import { useState, useEffect } from "react";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Feedback {
  id: string;
  userId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filtered, setFiltered] = useState<Feedback[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, count: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [resList, resStats] = await Promise.all([
        fetch("http://localhost:8080/api/admin/feedback", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        }),
        fetch("http://localhost:8080/api/admin/feedback/stats", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        })
      ]);
      if (!resList.ok) throw new Error("Failed to fetch feedback list");
      if (!resStats.ok) throw new Error("Failed to fetch feedback stats");

      const list: Feedback[] = await resList.json();
      const statsData = await resStats.json();
      setFeedbacks(list);
      setFiltered(list);
      setStats(statsData);
    } catch (err: any) {
      toast.error(err.message || "Error loading feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setFiltered(
      feedbacks.filter(fb =>
        fb.comment.toLowerCase().includes(search.toLowerCase()) ||
        fb.userId?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, feedbacks]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/admin/feedback/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      setFeedbacks(feedbacks.filter(fb => fb.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Delete error");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Feedback Report", 14, 20);
    autoTable(doc, {
      head: [["User ID", "Rating", "Comment", "Date"]],
      body: feedbacks.map(fb => [
        fb.userId || "—",
        fb.rating.toString(),
        fb.comment,
        new Date(fb.createdAt).toLocaleString()
      ]),
      startY: 30,
    });
    doc.save("feedback-report.pdf");
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Feedback Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Feedbacks</p>
            <h2 className="text-2xl font-bold">{stats.count}</h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <h2 className="text-2xl font-bold">{stats.averageRating.toFixed(2)}</h2>
          </div>
          <Button variant="outline" onClick={exportPDF} className="ml-auto">
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by user or comment…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={fetchAll}>
          {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : "Refresh"}
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6"/></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(fb => (
                <TableRow key={fb.id}>
                  <TableCell>{fb.userId || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={fb.rating >= 4 ? "default" : "secondary"}>
                      {fb.rating}★
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{fb.comment}</TableCell>
                  <TableCell>
                    {new Date(fb.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(fb.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
