<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DetectMobileClient
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Check for explicit client type header
        $clientType = $request->header('X-Client-Type');
        
        if ($clientType) {
            $request->attributes->set('client_type', strtolower($clientType));
        } else {
            // Detect mobile based on User-Agent
            $userAgent = $request->userAgent();
            $mobileKeywords = [
                'mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
                'windows phone', 'opera mini', 'palm', 'smartphone'
            ];
            
            $isMobile = false;
            foreach ($mobileKeywords as $keyword) {
                if (stripos($userAgent, $keyword) !== false) {
                    $isMobile = true;
                    break;
                }
            }
            
            $request->attributes->set('client_type', $isMobile ? 'mobile' : 'web');
        }
        
        return $next($request);
    }
}
