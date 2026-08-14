<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VideoStreamingController extends Controller
{
    public function stream(Video $video)
    {
        // Enforce authentication & permissions
        $user = Auth::user();
        if (!$user || ($user->role !== 'member' && $user->role !== 'admin')) {
            abort(403, 'Unauthorized stream request.');
        }

        if ($user->role === 'member') {
            if ($user->status !== 'approved') {
                abort(403, 'Your member account is pending approval.');
            }

            // If not a free preview video, check if user has approved premium access
            if (!$video->is_free) {
                if ($user->premium_access !== 'approved') {
                    abort(403, 'Access denied. You must request and receive approval to access premium videos.');
                }
            }
        }

        if ($video->storage_type === 'external') {
            // For external secure urls
            return redirect($video->video_path);
        }

        $path = storage_path('app/' . $video->video_path);

        if (!file_exists($path)) {
            abort(404, 'Video file not found.');
        }

        $stream = fopen($path, 'rb');
        $size = filesize($path);
        $length = $size;
        $start = 0;
        $end = $size - 1;

        $headers = [
            'Content-Type' => 'video/mp4',
            'Accept-Ranges' => 'bytes',
        ];

        if (isset($_SERVER['HTTP_RANGE'])) {
            list(, $range) = explode('=', $_SERVER['HTTP_RANGE'], 2);
            if (strpos($range, ',') !== false) {
                return response('Requested Range Not Satisfiable', 416, [
                    'Content-Range' => "bytes $start-$end/$size"
                ]);
            }
            
            if ($range === '-') {
                $c_start = $start;
                $c_end = $end;
            } else {
                $range = explode('-', $range);
                $c_start = intval($range[0]);
                $c_end = (isset($range[1]) && is_numeric($range[1])) ? intval($range[1]) : $size - 1;
            }
            
            $c_end = ($c_end > $end) ? $end : $c_end;
            
            if ($c_start > $c_end || $c_start > $size - 1 || $c_end >= $size) {
                return response('Requested Range Not Satisfiable', 416, [
                    'Content-Range' => "bytes $start-$end/$size"
                ]);
            }
            
            $start = $c_start;
            $end = $c_end;
            $length = $end - $start + 1;
            fseek($stream, $start);
            
            $headers['Content-Range'] = "bytes $start-$end/$size";
            $status = 206;
        } else {
            $status = 200;
        }

        $headers['Content-Length'] = $length;

        return response()->stream(function () use ($stream, $length) {
            $chunkSize = 1024 * 8; // 8KB chunk
            $bytesSent = 0;
            while (!feof($stream) && $bytesSent < $length) {
                $readLength = min($chunkSize, $length - $bytesSent);
                $buffer = fread($stream, $readLength);
                echo $buffer;
                flush();
                $bytesSent += strlen($buffer);
            }
            fclose($stream);
        }, $status, $headers);
    }

    public function publicStream(Video $video)
    {
        // Enforce video is marked as free preview
        if (!$video->is_free) {
            abort(403, 'Unauthorized stream request.');
        }

        if ($video->storage_type === 'external') {
            return redirect($video->video_path);
        }

        $path = storage_path('app/' . $video->video_path);

        if (!file_exists($path)) {
            abort(404, 'Video file not found.');
        }

        $stream = fopen($path, 'rb');
        $size = filesize($path);
        $length = $size;
        $start = 0;
        $end = $size - 1;

        $headers = [
            'Content-Type' => 'video/mp4',
            'Accept-Ranges' => 'bytes',
        ];

        if (isset($_SERVER['HTTP_RANGE'])) {
            list(, $range) = explode('=', $_SERVER['HTTP_RANGE'], 2);
            if (strpos($range, ',') !== false) {
                return response('Requested Range Not Satisfiable', 416, [
                    'Content-Range' => "bytes $start-$end/$size"
                ]);
            }
            
            if ($range === '-') {
                $c_start = $start;
                $c_end = $end;
            } else {
                $range = explode('-', $range);
                $c_start = intval($range[0]);
                $c_end = (isset($range[1]) && is_numeric($range[1])) ? intval($range[1]) : $size - 1;
            }
            
            $c_end = ($c_end > $end) ? $end : $c_end;
            
            if ($c_start > $c_end || $c_start > $size - 1 || $c_end >= $size) {
                return response('Requested Range Not Satisfiable', 416, [
                    'Content-Range' => "bytes $start-$end/$size"
                ]);
            }
            
            $start = $c_start;
            $end = $c_end;
            $length = $end - $start + 1;
            fseek($stream, $start);
            
            $headers['Content-Range'] = "bytes $start-$end/$size";
            $status = 206;
        } else {
            $status = 200;
        }

        $headers['Content-Length'] = $length;

        return response()->stream(function () use ($stream, $length) {
            $chunkSize = 1024 * 8; // 8KB chunk
            $bytesSent = 0;
            while (!feof($stream) && $bytesSent < $length) {
                $readLength = min($chunkSize, $length - $bytesSent);
                $buffer = fread($stream, $readLength);
                echo $buffer;
                flush();
                $bytesSent += strlen($buffer);
            }
            fclose($stream);
        }, $status, $headers);
    }
}
