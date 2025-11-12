"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Eye,
  FileDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  User2,
} from "lucide-react";
import {
  listUsersRequest,
  deleteUserRequest,
  toggleUserStatusRequest,
} from "@/app/lib/request/authRequest";
import { DataTable } from "@/components/Tablecomponents";
import ConfirmDialog from "@/components/ConfirmDialog";
import ViewDialog from "@/components/ViewDialog";
import ExportModal from "@/components/ExportModal";
import toast from "react-hot-toast";
import { getActiveInstitutions } from "@/app/lib/request/institutionRequest";

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  mobileNo: string;
  designation: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  lastLoginTimeDate?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [institutions, setInstitutions] = useState<{ value: string; label: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInstitution, setSelectedInstitution] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selected, setSelected] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "toggle" | null>(
    null
  );
  const [exportOpen, setExportOpen] = useState(false);



  /** 🔹 Fetch Users */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsersRequest({
        page: currentPage,
        search: searchTerm,
        status: statusFilter,
        role: selectedRole,
        instituteId: selectedInstitution,
      });

      setUsers(res.users.docs || []);
      setTotalPages(res.users.totalPages || 1);
    } catch (err: any) {
      console.error("Error fetching users:", err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, selectedRole, selectedInstitution]);

  useEffect(() => {

    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const activeInstitutions = await getActiveInstitutions();

        const options = activeInstitutions.map((inst: any) => ({
          value: inst.instituteId,
          label: inst.name,
        }));

        setInstitutions(options);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load institutions");
      }
    };

    loadInstitutions();
  }, []);


  /** 🔹 Confirm Actions */
  const handleDelete = (user: User) => {
    setSelected(user);
    setConfirmType("delete");
    setConfirmOpen(true);
  };

  const handleToggle = (user: User) => {
    setSelected(user);
    setConfirmType("toggle");
    setConfirmOpen(true);
  };

  /** 🔹 Confirmed Delete/Toggle (Superadmin only) */
  const confirmAction = async () => {
    if (!selected) return;
    try {
      if (confirmType === "delete") {
        await deleteUserRequest(selected._id);
        
      } else if (confirmType === "toggle") {
        const newStatus = selected.status === "active" ? "inactive" : "active";
        await toggleUserStatusRequest(selected._id, newStatus);
      
      }
      await fetchUsers();
    } catch (err: any) {
      alert(err.message);
      console.error("Action failed:", err);
    } finally {
      setConfirmOpen(false);
      setSelected(null);
      setConfirmType(null);
    }
  };

  /** 🔹 Table Columns */
  const columns = [
    { header: "Name", render: (u: User) => `${u.firstname} ${u.lastname}` },
    { header: "Username", accessor: "username" },
    { header: "Email", accessor: "email" },
    { header: "Mobile", accessor: "mobileNo" },
    { header: "Role", accessor: "role" },
    {
      header: "Status",
      render: (u: User) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
            }`}
        >
          {u.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (user: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleToggle(user)}
            className={`w-24 px-3 py-1 rounded-md text-center transition ${user.status === "active"
              ? "bg-red-100 text-red-700 border border-red-400 hover:bg-red-200"
              : "bg-green-100 text-green-700 border border-green-400 hover:bg-green-200"
              }`}
          >
            {user.status === "active" ? "Deactivate" : "Activate"}
          </button>

          <button
            onClick={() => {
              const viewData: any = {
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                mobileNo: user.mobileNo,
                designation: user.designation,
                role: user.role,
                status: user.status,
                lastLoginTimeDate: user.lastLoginTimeDate
                  ? new Date(user.lastLoginTimeDate).toLocaleString()
                  : "Never",
                createdAt: new Date(user.createdAt).toLocaleString(),
                updatedAt: new Date(user.updatedAt).toLocaleString(),
              };

              setSelected(viewData);
              setViewOpen(true);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md"
          >
            <Eye className="w-4 h-4" />
          </button>



          {user.role !== "superadmin" && (
            <>
              {/* <Link
                href={`/users/edit?id=${user._id}` as any}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
              >
                <Pencil className="w-4 h-4" />
              </Link> */}

              <button
                onClick={() => handleDelete(user)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ✅ Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <User2 className="w-6 h-6 text-blue-700" />
          <h1 className="text-2xl font-semibold">Users</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-56 pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Institution Filter */}
          <select
            value={selectedInstitution}
            onChange={(e) => {
              setSelectedInstitution(e.target.value);
              setCurrentPage(1);
            }}
            className="border text-sm rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Institutions</option>
            {institutions.map((inst) => (
              <option key={inst.value} value={inst.value}>
                {inst.label}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="border text-sm rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border text-sm rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Export */}
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white px-3 py-2 text-sm rounded-md"
          >
            <FileDown className="w-4 h-4" /> Export
          </button>

          {/* Add User */}
          <Link
            href={"/users/adduser" as any}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-md"
          >
            <Plus className="w-4 h-4" /> Add New
          </Link>
        </div>

      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />


      <ViewDialog
        open={viewOpen}
        title="User Details"
        data={selected}
        onClose={() => setViewOpen(false)}
      />


      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmType === "delete" ? "Delete User" : "Change User Status"
        }
        message={
          confirmType === "delete"
            ? `Are you sure you want to delete "${selected?.firstname} ${selected?.lastname}"?`
            : `Are you sure you want to ${selected?.status === "active" ? "deactivate" : "activate"
            } "${selected?.firstname} ${selected?.lastname}"?`
        }
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* ✅ Export Modal */}
      {/* <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} /> */}
    </div>
  );
}
