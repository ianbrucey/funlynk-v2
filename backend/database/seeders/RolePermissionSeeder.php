<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Core Permissions
        $corePermissions = [
            // User Management
            'view users',
            'create users',
            'edit users',
            'delete users',
            
            // Role & Permission Management
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'assign roles',
            'view permissions',
            'create permissions',
            'edit permissions',
            'delete permissions',
            'assign permissions',
            
            // System Administration
            'view system settings',
            'edit system settings',
            'view logs',
            'clear cache',
            'backup system',
            'restore system',
            
            // Content Management
            'view content',
            'create content',
            'edit content',
            'delete content',
            'publish content',
            'moderate content',
        ];

        // Create Spark Permissions (Feature-specific)
        $sparkPermissions = [
            // Dashboard & Analytics
            'view dashboard',
            'view analytics',
            'export analytics',
            
            // API Management
            'view api keys',
            'create api keys',
            'edit api keys',
            'delete api keys',
            
            // Notifications
            'view notifications',
            'create notifications',
            'send notifications',
            'delete notifications',
            
            // File Management
            'view files',
            'upload files',
            'download files',
            'delete files',
            
            // Reporting
            'view reports',
            'create reports',
            'edit reports',
            'delete reports',
            'export reports',
            
            // Integration Management
            'view integrations',
            'create integrations',
            'edit integrations',
            'delete integrations',
            'sync integrations',
        ];

        // Create all permissions
        $allPermissions = array_merge($corePermissions, $sparkPermissions);
        
        foreach ($allPermissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Roles and assign permissions
        
        // Super Admin Role - has all permissions
        $superAdmin = Role::create(['name' => 'super-admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin Role - has most permissions but not system-critical ones
        $admin = Role::create(['name' => 'admin']);
        $adminPermissions = collect($allPermissions)->reject(function ($permission) {
            return in_array($permission, [
                'delete users',
                'backup system',
                'restore system',
                'clear cache',
                'view logs',
                'edit system settings',
            ]);
        });
        $admin->givePermissionTo($adminPermissions);

        // Editor Role - content and basic management
        $editor = Role::create(['name' => 'editor']);
        $editorPermissions = [
            'view content',
            'create content',
            'edit content',
            'delete content',
            'publish content',
            'moderate content',
            'view files',
            'upload files',
            'download files',
            'view dashboard',
            'view notifications',
            'view reports',
            'create reports',
            'edit reports',
        ];
        $editor->givePermissionTo($editorPermissions);

        // Moderator Role - content moderation focused
        $moderator = Role::create(['name' => 'moderator']);
        $moderatorPermissions = [
            'view content',
            'edit content',
            'moderate content',
            'view dashboard',
            'view notifications',
            'view reports',
            'view files',
        ];
        $moderator->givePermissionTo($moderatorPermissions);

        // User Role - basic user permissions
        $user = Role::create(['name' => 'user']);
        $userPermissions = [
            'view content',
            'view dashboard',
            'view notifications',
            'view files',
            'upload files',
            'download files',
        ];
        $user->givePermissionTo($userPermissions);

        // API User Role - for API access
        $apiUser = Role::create(['name' => 'api-user']);
        $apiUserPermissions = [
            'view content',
            'create content',
            'edit content',
            'view files',
            'upload files',
            'download files',
            'view api keys',
        ];
        $apiUser->givePermissionTo($apiUserPermissions);

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
