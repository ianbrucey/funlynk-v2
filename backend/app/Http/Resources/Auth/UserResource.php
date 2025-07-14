<?php

namespace App\Http\Resources\Auth;

use App\Http\Resources\BaseResource;
use Illuminate\Http\Request;

class UserResource extends BaseResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'name' => $this->name,
            'full_name' => $this->full_name,
            'initials' => $this->initials,
            'email' => $this->email,
            'phone' => $this->phone,
            'formatted_phone' => $this->formatted_phone,
            'country_code' => $this->country_code,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'age' => $this->age,
            'gender' => $this->gender,
            'bio' => $this->bio,
            'avatar' => $this->avatar,
            'avatar_url' => $this->avatar_url,
            'timezone' => $this->timezone,
            'timezone_display' => $this->timezone_display,
            'language' => $this->language,
            'is_active' => $this->is_active,
            'is_profile_complete' => $this->is_profile_complete,
            'is_recently_active' => $this->is_recently_active,
            'status' => $this->status,
            'email_verified_at' => $this->email_verified_at?->toDateTimeString(),
            'last_login_at' => $this->last_login_at?->toDateTimeString(),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->pluck('name');
            }),
            'permissions' => $this->whenLoaded('permissions', function () {
                return $this->permissions->pluck('name');
            }),
        ];
    }
}
