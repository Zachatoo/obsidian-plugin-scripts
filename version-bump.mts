import { readJsonFile, writeJsonFile } from "./utils/file-helpers.mjs";
import { invariant } from "./utils/invariant.mjs";

async function main() {
	const targetVersion = process.env.npm_package_version;
	invariant(targetVersion, "Missing targetVersion");

	const manifest = await readJsonFile("manifest.json");
	invariant(
		manifest && typeof manifest === "object",
		"Missing manifest.json"
	);
	invariant(
		"minAppVersion" in manifest &&
			typeof manifest.minAppVersion === "string",
		"Missing minAppVersion in manifest.json"
	);
	const { minAppVersion } = manifest;
	invariant("version" in manifest, "Missing version in manifest.json");
	manifest.version = targetVersion;
	await writeJsonFile("manifest.json", manifest);

	const versions = await readJsonFile("versions.json");
	invariant(
		versions && typeof versions === "object",
		"Missing versions.json"
	);
	const typedVersions = versions as { [key: string]: string };
	typedVersions[targetVersion] = minAppVersion;
	await writeJsonFile("versions.json", typedVersions);

	const pkgLock = await readJsonFile("package-lock.json");
	invariant(
		pkgLock && typeof pkgLock === "object",
		"Missing package-lock.json"
	);
	invariant("version" in pkgLock, "Missing version in package-lock.json");
	pkgLock.version = targetVersion;
	invariant(
		"packages" in pkgLock &&
			pkgLock.packages &&
			typeof pkgLock.packages === "object",
		"Missing packages in package-lock.json"
	);
	invariant(
		"" in pkgLock.packages &&
			pkgLock.packages[""] &&
			typeof pkgLock.packages[""] === "object" &&
			"version" in pkgLock.packages[""] &&
			typeof pkgLock.packages[""].version === "string",
		"Missing nested version in package-lock.json"
	);
	pkgLock.packages[""].version = targetVersion;
	await writeJsonFile("package-lock.json", pkgLock);
}

main();
