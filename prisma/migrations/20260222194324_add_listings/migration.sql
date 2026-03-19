-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "originalPrice" INTEGER,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "image" TEXT,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sellerId" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    CONSTRAINT "listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "listings_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
