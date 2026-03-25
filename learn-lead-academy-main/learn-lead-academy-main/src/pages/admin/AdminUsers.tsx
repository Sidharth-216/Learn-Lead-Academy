import { useState, useEffect } from "react";
import { Search, MoreHorizontal, UserCheck, UserX, Mail, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { adminApi, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

const AdminUsers = () => {
  const [users,      setUsers]      = useState<AdminUser[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search,     setSearch]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading,    setLoading]    = useState(true);
  const [toggling,   setToggling]   = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load users
  useEffect(() => {
    setLoading(true);
    adminApi
      .getUsers({ page, pageSize: 20, search: debouncedSearch || undefined })
      .then((res) => {
        setUsers(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => toast.error(err.message ?? "Failed to load users."))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  const toggleStatus = async (user: AdminUser) => {
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    setToggling(user.id);
    try {
      const updated = await adminApi.updateUserStatus(user.id, newStatus);
      setUsers((prev) => prev.map((u) => u.id === user.id ? updated : u));
      toast.success(`${user.name} is now ${newStatus.toLowerCase()}.`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update status.");
    } finally {
      setToggling(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-foreground">Manage Users</h1>
        <p className="text-muted-foreground mt-1">{total} registered users</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10"
        />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Courses</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-hero flex items-center justify-center text-primary-foreground font-display font-bold text-xs flex-shrink-0">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant={user.role === "Admin" ? "default" : "secondary"}
                          className={user.role === "Admin" ? "bg-hero text-primary-foreground" : ""}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {user.enrolledCourses}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === "Active" ? "outline" : "destructive"}
                          className={user.status === "Active" ? "border-green-500 text-green-600" : ""}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={toggling === user.id}>
                              {toggling === user.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <MoreHorizontal className="w-4 h-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleStatus(user)}>
                              {user.status === "Active"
                                ? <><UserX className="w-4 h-4 mr-2" /> Suspend</>
                                : <><UserCheck className="w-4 h-4 mr-2" /> Activate</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`mailto:${user.email}`)}>
                              <Mail className="w-4 h-4 mr-2" /> Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;