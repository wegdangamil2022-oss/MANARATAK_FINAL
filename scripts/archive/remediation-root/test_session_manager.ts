import { PrismaClient } from '@prisma/client';
import { PrismaSessionManager } from './packages/infrastructure/src/auth/PrismaSessionManager';

async function run() {
  const adminUrl = "postgresql://ai_studio_admin:P3%25__65uR%2Bkxgk%24.@localhost/cloud_sql_development_database?host=/app/cloudsql/linear-operand-1tgzl:europe-west1:ai-studio-95237b5c";
  const appUrl = "postgresql://ai_studio_app_user:kP%247F3o%2FpGQRyhp%29@localhost/cloud_sql_development_database?host=/app/cloudsql/linear-operand-1tgzl:europe-west1:ai-studio-95237b5c";

  const adminPrisma = new PrismaClient({ datasources: { db: { url: adminUrl } } });
  
  // create dummy identity
  await adminPrisma.identityRecord.create({
    data: {
      id: "test-user-id",
      type: "user",
      status: "active",
      createdBy: "test",
      version: 1
    }
  });

  const appPrisma = new PrismaClient({ datasources: { db: { url: appUrl } } });
  const sessionManager = new PrismaSessionManager(appPrisma);

  console.log("Testing createSession...");
  await sessionManager.createSession("test-user-id", "my-secret-token");
  console.log("Session created.");

  const isValid = await sessionManager.isValidSession("test-user-id", "my-secret-token");
  console.log("Is valid?", isValid);

  console.log("Testing revokeSession...");
  await sessionManager.revokeSession("test-user-id", "my-secret-token");
  
  const isValidAfter = await sessionManager.isValidSession("test-user-id", "my-secret-token");
  console.log("Is valid after revoke?", isValidAfter);

  console.log("Testing revokeAllSessions...");
  await sessionManager.revokeAllSessions("test-user-id");

  // Verify raw token is not stored
  const session = await adminPrisma.sessionRecord.findFirst({ where: { identityId: "test-user-id" } });
  console.log("Session in DB:", session);
  console.log("Raw token matches refreshTokenHash?", session?.refreshTokenHash === "my-secret-token");

  // Cleanup
  await adminPrisma.identityRecord.delete({ where: { id: "test-user-id" } });
  console.log("Cleanup done.");

  await adminPrisma.$disconnect();
  await appPrisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
