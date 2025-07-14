<?php

namespace App\Services\Shared;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Email Service
 * 
 * Handles all email communications for the application
 */
class EmailService
{
    /**
     * Send welcome email to new user
     *
     * @param string $email
     * @param string $name
     * @return bool
     */
    public function sendWelcomeEmail(string $email, string $name): bool
    {
        try {
            Mail::send('emails.welcome', ['name' => $name], function ($message) use ($email, $name) {
                $message->to($email, $name)
                        ->subject('Welcome to Funlynk!');
            });
            
            Log::info('Welcome email sent successfully', ['email' => $email]);
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send welcome email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send password reset email
     *
     * @param string $email
     * @param string $name
     * @param string $resetUrl
     * @return bool
     */
    public function sendPasswordResetEmail(string $email, string $name, string $resetUrl): bool
    {
        try {
            Mail::send('emails.password-reset', [
                'name' => $name,
                'resetUrl' => $resetUrl
            ], function ($message) use ($email, $name) {
                $message->to($email, $name)
                        ->subject('Reset Your Funlynk Password');
            });
            
            Log::info('Password reset email sent successfully', ['email' => $email]);
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send password reset email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send email verification email
     *
     * @param string $email
     * @param string $name
     * @param string $verificationUrl
     * @return bool
     */
    public function sendEmailVerification(string $email, string $name, string $verificationUrl): bool
    {
        try {
            Mail::send('emails.verify-email', [
                'name' => $name,
                'verificationUrl' => $verificationUrl
            ], function ($message) use ($email, $name) {
                $message->to($email, $name)
                        ->subject('Verify Your Funlynk Email Address');
            });
            
            Log::info('Email verification sent successfully', ['email' => $email]);
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send email verification', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send event invitation email
     *
     * @param string $email
     * @param string $name
     * @param array $eventData
     * @return bool
     */
    public function sendEventInvitation(string $email, string $name, array $eventData): bool
    {
        try {
            Mail::send('emails.event-invitation', [
                'name' => $name,
                'event' => $eventData
            ], function ($message) use ($email, $name, $eventData) {
                $message->to($email, $name)
                        ->subject('You\'re Invited: ' . $eventData['title']);
            });
            
            Log::info('Event invitation sent successfully', [
                'email' => $email,
                'event_id' => $eventData['id'] ?? null
            ]);
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send event invitation', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send permission slip email for Spark programs
     *
     * @param string $email
     * @param string $parentName
     * @param array $tripData
     * @param string $permissionSlipUrl
     * @return bool
     */
    public function sendPermissionSlipEmail(string $email, string $parentName, array $tripData, string $permissionSlipUrl): bool
    {
        try {
            Mail::send('emails.permission-slip', [
                'parentName' => $parentName,
                'trip' => $tripData,
                'permissionSlipUrl' => $permissionSlipUrl
            ], function ($message) use ($email, $parentName, $tripData) {
                $message->to($email, $parentName)
                        ->subject('Permission Slip Required: ' . $tripData['program_title']);
            });
            
            Log::info('Permission slip email sent successfully', [
                'email' => $email,
                'trip_id' => $tripData['id'] ?? null
            ]);
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send permission slip email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send notification email
     *
     * @param string $email
     * @param string $name
     * @param string $subject
     * @param string $message
     * @return bool
     */
    public function sendNotificationEmail(string $email, string $name, string $subject, string $message): bool
    {
        try {
            Mail::send('emails.notification', [
                'name' => $name,
                'content' => $message
            ], function ($mail) use ($email, $name, $subject) {
                $mail->to($email, $name)
                     ->subject($subject);
            });
            
            Log::info('Notification email sent successfully', ['email' => $email]);
            return true;
        } catch (Exception $e) {
            Log::error('Failed to send notification email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send bulk emails
     *
     * @param array $recipients
     * @param string $subject
     * @param string $template
     * @param array $data
     * @return array
     */
    public function sendBulkEmails(array $recipients, string $subject, string $template, array $data = []): array
    {
        $results = [
            'sent' => 0,
            'failed' => 0,
            'errors' => []
        ];

        foreach ($recipients as $recipient) {
            try {
                Mail::send($template, array_merge($data, ['name' => $recipient['name']]), 
                    function ($message) use ($recipient, $subject) {
                        $message->to($recipient['email'], $recipient['name'])
                                ->subject($subject);
                    });
                
                $results['sent']++;
                Log::info('Bulk email sent successfully', ['email' => $recipient['email']]);
            } catch (Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'email' => $recipient['email'],
                    'error' => $e->getMessage()
                ];
                Log::error('Failed to send bulk email', [
                    'email' => $recipient['email'],
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $results;
    }
}
