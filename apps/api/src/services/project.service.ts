import { prisma } from "../lib/prisma.js";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "../schemas/project.schema.js";

const DEV_USER_EMAIL = "dev@shiploop.local";
const DEV_USER_PASSWORD = "dev-password-placeholder";

async function getOrCreateDevUser() {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: DEV_USER_EMAIL,
    },
  });

  if (existingUser) return existingUser;

  return prisma.user.create({
    data: {
      email: DEV_USER_EMAIL,
      name: "Dev User",
      password: DEV_USER_PASSWORD,
    },
  });
}

export async function createProject(input: CreateProjectInput) {
  const user = await getOrCreateDevUser();

  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId: user.id,
    },
  });
}

export async function getProjects() {
  const user = await getOrCreateDevUser();

  const projects = await prisma.project.findMany({
    where: {
      ownerId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

export async function getProjectById(projectId: string) {
  const user = await getOrCreateDevUser();

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: user.id,
    },
  });

  return project;
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
) {
  const user = await getOrCreateDevUser();

  const updatedProject = await prisma.project.updateMany({
    where: {
      id: projectId,
      ownerId: user.id,
    },
    data: input,
  });

  return updatedProject;
}

export async function deleteProject(projectId: string) {
  const user = await getOrCreateDevUser();

  const deletedProject = await prisma.project.deleteMany({
    where: {
      id: projectId,
      ownerId: user.id,
    },
  });

  return deletedProject;
}
