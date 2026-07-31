export interface LocalProject {
  id: string;
  ownerEmail: string;
  name: string;
  originalFilename: string;
  originalWidth: number;
  originalHeight: number;
  format: string;
  thumbnail: string;
  image: Blob;
  createdAt: number;
  updatedAt: number;
}

const DATABASE_NAME = "pixelforge-local";
const STORE_NAME = "projects";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("updatedAt", "updatedAt");
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function createThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, 360 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/webp", 0.8));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not create image thumbnail"));
    };
    image.src = url;
  });
}

export async function createLocalProject(file: File, width: number, height: number, ownerEmail: string): Promise<LocalProject> {
  const now = Date.now();
  const project: LocalProject = {
    id: crypto.randomUUID(),
    ownerEmail: ownerEmail.toLowerCase(),
    name: file.name.replace(/\.[^/.]+$/, "") || "Untitled Project",
    originalFilename: file.name,
    originalWidth: width,
    originalHeight: height,
    format: file.type,
    thumbnail: await createThumbnail(file),
    image: file,
    createdAt: now,
    updatedAt: now,
  };
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(project);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  return project;
}

export async function listLocalProjects(ownerEmail: string): Promise<LocalProject[]> {
  const database = await openDatabase();
  const projects = await new Promise<LocalProject[]>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as LocalProject[]);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return projects
    .filter((project) => project.ownerEmail === ownerEmail.toLowerCase())
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getLocalProject(id: string, ownerEmail: string): Promise<LocalProject | undefined> {
  const database = await openDatabase();
  const project = await new Promise<LocalProject | undefined>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as LocalProject | undefined);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return project?.ownerEmail === ownerEmail.toLowerCase() ? project : undefined;
}

export async function deleteLocalProject(id: string, ownerEmail: string): Promise<void> {
  const project = await getLocalProject(id, ownerEmail);
  if (!project) throw new Error("Project not found");
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
