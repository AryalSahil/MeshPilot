# Firestore Security Specification (TDD)

## 1. Data Invariants
- A user document `/users/{userId}` is strictly owned by the user with UID `userId`. It cannot be modified by other regular users.
- An organization document `/organizations/{orgId}` can only be read or written by its owner or registered members.
- A project document `/projects/{projectId}` belongs to an organization. Only members of that organization can access or manage the project.
- A monitor document `/monitors/{monitorId}` points to a valid project. Only project collaborators can manage its monitors.
- A monitor check `/monitor_checks/{checkId}` belongs to a monitor. Users can only read checks for monitors they have access to.

## 2. The "Dirty Dozen" Payloads
The following payloads attempt to bypass identity, integrity, or structure constraints, and must return `PERMISSION_DENIED`:

1. **Self-Promote Role**: An anonymous or regular user tries to set their role to `ADMIN` or `SUPER_ADMIN` on user creation.
2. **Identity Spoofing on Create**: User `alice` tries to write a user profile for user `bob` (`/users/bob`).
3. **User Status Poisoning**: A user tries to reactivate or bypass suspension by changing their own status to `ACTIVE`.
4. **Orphaned Organization Create**: Creating an organization where `ownerId` does not match the authenticated user's UID.
5. **Malicious Organization Hijack**: User `alice` tries to update an organization owned by `bob` to set herself as the owner.
6. **Orphaned Project Create**: Creating a project with an `organizationId` of an organization the user does not belong to.
7. **Invalid Monitor Interval**: Creating a monitor with an interval of `42` seconds (not in the allowed list of [60, 300, 600, 900, 1800, 3600]).
8. **Malicious Monitor URL Injection**: Injecting a javascript protocol or an unsafe URL format into a monitor configuration.
9. **Private Range SSRF Probe**: Registering a monitor pointing to an AWS Metadata IP `169.254.169.254` to attempt network scanning.
10. **Denial of Wallet Check Poisoning**: Creating a check document `/monitor_checks/{checkId}` with 500KB of arbitrary base64 metadata.
11. **Check Identity Spoofing**: Writing a check result for a monitor belonging to another user's project.
12. **Status Shortcutting/Temporal Poisoning**: Forging `createdAt` or `updatedAt` to be in the past or future instead of using the server's `request.time`.

## 3. Test Rules Draft (firestore.rules)
Hardened security rules will validate all constraints mathematically.
