"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  FileDown,
  Building2,
  Search,
  Filter,
} from "lucide-react";
import {
  getAllInstitutions,
  deleteInstitution,
  updateInstitution,
} from "@/app/lib/request/institutionRequest";
import { DataTable } from "@/components/Tablecomponents";
import ConfirmDialog from "@/components/ConfirmDialog";
import ViewDialog from "@/components/ViewDialog";
import ExportModal from "@/components/ExportModal";
import { getaccesscontrol } from "@/app/lib/request/permissionRequest";

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "toggle" | null>(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [userpermission, setUserpermisssion] = useState<any | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(true);


  const filteredInstitutions = (institutions || []).map(inst => ({
    InstituteId: inst.instituteId || "-",
    name: inst.name || "-",
    country: inst.country || "-",
    state: inst.state || "-",
    email: inst.email || "-",
    phoneNo: inst.phoneNo || "-",
    Status: inst.status || "-"
  }));


  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
      });
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);

      const data = await getAllInstitutions({
        page: currentPage,
        search: searchTerm,
        status: statusFilter,
      });

      setInstitutions(data?.institutions?.docs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, skipping API call");
        setHasPermission(false);
        return;
      }

      try {
        const payload = token.split(".")[1];
        const decoded: any = JSON.parse(atob(payload));

        if ((decoded.role === "admin" || decoded.role === "user") && decoded.instituteId) {
          const data = await getaccesscontrol({
            role: decoded.role,
            instituteId: decoded.instituteId
          });

          const institutionPermission = data.permissions?.find(
            (p: any) => p.moduleName === "Institution"
          );

          if (
            institutionPermission &&
            (institutionPermission.view ||
              institutionPermission.create ||
              institutionPermission.edit ||
              institutionPermission.delete ||
              institutionPermission.filter ||
              institutionPermission.download)
          ) {
            // At least one permission is true → has access
            setUserpermisssion(institutionPermission);
            setHasPermission(true);
          } else {
            // No permission at all → show message
            setUserpermisssion(null);
            setHasPermission(false);
          }
        } else if (decoded.role === "superadmin") {
          // Superadmin has all access
          setUserpermisssion("superadmin");
          setHasPermission(true);
        } else {
          // Unknown role → no permission
          setHasPermission(false);
        }
      } catch (error) {
        console.error("Failed to decode token or fetch permissions:", error);
        setHasPermission(false);
      }
    };

    fetchPermissions();
  }, []);

  useEffect(() => {
    fetchInstitutions();
  }, [currentPage, searchTerm, statusFilter]);

  const handleDelete = (inst: any) => {
    setSelected(inst);
    setConfirmType("delete");
    setConfirmOpen(true);
  };

  const handleToggle = (inst: any) => {
    setSelected(inst);
    setConfirmType("toggle");
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!selected) return;
    try {
      if (confirmType === "delete") {
        await deleteInstitution(selected._id);
      } else if (confirmType === "toggle") {
        const newStatus = selected.status === "active" ? "inactive" : "active";
        await updateInstitution(selected._id, { status: newStatus });
      }
      await fetchInstitutions();
    } finally {
      setConfirmOpen(false);
      setSelected(null);
      setConfirmType(null);
    }
  };

  const columns = [
    { header: "Institute ID", accessor: "instituteId" },
    { header: "Institution Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phoneNo" },
    { header: "Status", accessor: "status" },
    {
      header: "Action",
      render: (inst: any) => (
        <div className="flex gap-2">
          {userpermission === "superadmin" || userpermission?.edit ? (<button
            onClick={() => handleToggle(inst)}
            className={`w-28 px-3 py-1 rounded-md text-center ${inst.status === "active"
              ? "bg-red-300/50 text-red-700 border border-red-400 hover:bg-red-300"
              : "bg-green-300/50 text-green-700 border border-green-400 hover:bg-green-300"
              }`}
          >
            {inst.status === "active" ? "Deactivate" : "Activate"}
          </button>) : null}


          {userpermission === "superadmin" || userpermission?.view ? (
            <button
              onClick={() => {
                const limitedData = {
                  name: inst.name,
                  email: inst.email,
                  phone: inst.phoneNo,
                  location: inst.location,
                  contactPerson: inst.contactPerson,
                  country: inst.country,
                  state: inst.state,
                  instituteType: inst.instituteType,
                  status: inst.status,
                };
                setSelected(limitedData);
                setViewOpen(true);
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md"
            >
              <Eye className="w-4 h-4" />
            </button>
          ) : null}


          {userpermission === "superadmin" || userpermission?.edit ? (
            <Link
              href={`/institution/editinstitution?id=${inst._id}` as any}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
            >
              <Pencil className="w-4 h-4" />
            </Link>
          ) : null}

          {userpermission === "superadmin" || userpermission?.delete ? (
            <button
              onClick={() => handleDelete(inst)
              }
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
            >
              <Trash2 className="w-4 h-4" />
            </button >
          ) : null}
        </div >
      ),
    },
  ];

  if (!hasPermission) {
    return (
      <div className="p-6 text-center text-red-600">
        You do not have permission to access this page. Please contact your superadmin.
      </div>
    );
  }


  return (
    <div className="p-6 space-y-6">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">

        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-700" />
          <h1 className="text-2xl font-semibold">Institutions</h1>
        </div>


        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {userpermission === "superadmin" || userpermission?.filter
            ? (
              <>
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
                    className="w-full sm:w-48 md:w-64 pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a4480] "
                  />
                </div>


                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto border text-sm rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-[#3a4480] "
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </>
            ) : null}

          {/* Export */}
          {userpermission === "superadmin" || userpermission?.download ? (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center justify-center gap-1 w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white px-3 py-2 text-sm rounded-md"
            >
              <FileDown className="w-4 h-4" /> Export
            </button>
          ) : null}

          {userpermission === "superadmin" || userpermission?.create ? (<Link
            href="/institution/addinstitution"
            className="flex items-center justify-center gap-1 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-md"
          >
            <Plus className="w-4 h-4" /> Add New
          </Link>
          ) : null}

        </div>
        <ExportModal
          open={open}
          title={"Institution"}
          onClose={() => setOpen(false)}
          data={filteredInstitutions}
        />

      </div>



      <DataTable
        columns={columns}
        data={institutions}
        loading={loading}
        currentPage={currentPage}
        totalPages={1}
        onPageChange={setCurrentPage}
      />


      <ViewDialog
        open={viewOpen}
        title="Institution Details"
        data={selected}
        onClose={() => setViewOpen(false)}
      />


      <ConfirmDialog
        open={confirmOpen}
        title={confirmType === "delete" ? "Delete Institution" : "Change Status"}
        message={
          confirmType === "delete"
            ? `Are you sure you want to delete "${selected?.name}"?`
            : `Are you sure you want to ${selected?.status === "active" ? "deactivate" : "activate"
            } "${selected?.name}"?`
        }
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />


    </div>
  );
}
