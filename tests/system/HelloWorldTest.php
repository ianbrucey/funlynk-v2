<?php

namespace Tests\System;

/**
 * HelloWorldTest
 * 
 * System validation test for the Funlynk V2 multi-agent communication system.
 * This test demonstrates proper task assignment, pickup, execution, and completion.
 * 
 * @package Tests\System
 * @author Warp Agent
 * @version 1.0.0
 */
class HelloWorldTest
{
    /**
     * Output a test message to validate system functionality.
     * 
     * This method demonstrates that the multi-agent system is working correctly
     * by outputting a predefined message following PSR-12 standards.
     * 
     * @return string The test message
     */
    public function sayHello(): string
    {
        return 'Hello World from Funlynk V2 Multi-Agent System!';
    }

    /**
     * Get system information for validation purposes.
     * 
     * @return array System information array
     */
    public function getSystemInfo(): array
    {
        return [
            'system' => 'Funlynk V2 Multi-Agent System',
            'agent' => 'Warp Agent',
            'task_id' => 'system_test_hello_world_001',
            'timestamp' => date('Y-m-d H:i:s'),
            'status' => 'operational',
            'message' => $this->sayHello()
        ];
    }
}
