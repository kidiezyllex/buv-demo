"use client";

import { useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { motion } from "framer-motion";
import { IconPlus } from "@tabler/icons-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
    useTasks,
    useDeleteTask,
    useTaskStatistics,
    useOverdueTasks,
} from "@/hooks/useTasks";
import { TaskTable } from "./TaskTable";
import { TaskDialog } from "./TaskDialog";
import { ITask } from "@/interface/task";
import Link from "next/link";
import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";

export default function TasksPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { data: tasksResponse, isLoading, isFetching } = useTasks({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
    });
    const { data: stats } = useTaskStatistics();
    const { data: overdueData } = useOverdueTasks();
    const { mutate: deleteTaskMutation, isPending: isDeleting } = useDeleteTask();

    const tasks = tasksResponse?.data?.tasks || tasksResponse?.data || [];
    const taskList = Array.isArray(tasks) ? tasks : [];
    const totalItems = tasksResponse?.data?.pagination?.total || taskList.length;
    const totalPages = tasksResponse?.data?.pagination?.totalPages || 1;

    const handleEdit = (task: ITask) => {
        setSelectedTask(task);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setSelectedTask(taskList.find((t: ITask) => t._id === id) || null);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedTask) return;
        return new Promise((resolve, reject) => {
            deleteTaskMutation(selectedTask._id, {
                onSuccess: () => {
                    setSelectedTask(null);
                    resolve(true);
                },
                onError: reject,
            });
        });
    };

    const overdueCount = Array.isArray(overdueData?.data) ? overdueData.data.length : overdueData?.data?.total ?? 0;

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1  p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/sys">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Phân công công việc</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
                        <div className="relative w-full md:w-80">
                            <Input
                                placeholder="Tìm theo nội dung, người nhận..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <div className="flex gap-2">
                            <Link href="/sys/tasks/logs">
                                <Button variant="outline">
                                    Nhật ký thi công
                                </Button>
                            </Link>
                            <Button
                                onClick={() => {
                                    setSelectedTask(null);
                                    setIsDialogOpen(true);
                                }}
                            >
                                <IconPlus className="mr-2 h-4 w-4" />
                                Phân công công việc
                            </Button>
                        </div>
                    </div>

                    {stats?.data && (
                        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-5 gap-2">
                            <Card className="p-3 border-darkBorderV1 bg-darkBackgroundV1/50">
                                <p className="text-xs text-neutral-300">Tổng</p>
                                <p className="text-lg font-semibold">{stats.data.total ?? 0}</p>
                            </Card>
                            <Card className="p-3 border-darkBorderV1 bg-darkBackgroundV1/50">
                                <p className="text-xs text-neutral-300">Chờ xử lý</p>
                                <p className="text-lg font-semibold">{stats.data.pending ?? 0}</p>
                            </Card>
                            <Card className="p-3 border-darkBorderV1 bg-darkBackgroundV1/50">
                                <p className="text-xs text-neutral-300">Đang thực hiện</p>
                                <p className="text-lg font-semibold">{stats.data.inProgress ?? 0}</p>
                            </Card>
                            <Card className="p-3 border-darkBorderV1 bg-darkBackgroundV1/50">
                                <p className="text-xs text-neutral-300">Hoàn thành</p>
                                <p className="text-lg font-semibold text-green-500">{stats.data.completed ?? 0}</p>
                            </Card>
                            <Card className="p-3 border-red-500/30 bg-red-500/5">
                                <p className="text-xs text-neutral-300">Quá hạn</p>
                                <p className="text-lg font-semibold text-red-400">{stats.data.overdue ?? overdueCount}</p>
                            </Card>
                        </div>
                    )}

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <TaskTable
                            tasks={taskList}
                            isLoading={isLoading || isFetching}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            currentPage={currentPage}
                            pageSize={pageSize}
                        />
                    </Card>

                    {totalItems > pageSize && (
                        <div className="flex justify-center">
                            <Pagination
                                page={currentPage}
                                pageSize={pageSize}
                                total={totalItems}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={isDeleting}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={`Xóa công việc`}
                description="Bạn có chắc chắn muốn xóa công việc này?"
                confirmText="Xóa"
                successMessage="Xóa công việc thành công"
                errorMessage="Xóa công việc thất bại"
            />

            <TaskDialog
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setSelectedTask(null);
                }}
                task={selectedTask}
            />
        </div>
    );
}
