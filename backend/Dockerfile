# Multi-stage build for Laravel backend

# Base stage with common dependencies
FROM php:8.1-fpm-alpine AS base
WORKDIR /var/www/html

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    postgresql-dev \
    supervisor \
    nginx \
    && docker-php-ext-install \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    && apk del --no-cache \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    postgresql-dev

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Development stage
FROM base AS development
COPY . /var/www/html
RUN composer install --optimize-autoloader
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# Build stage
FROM base AS build

# Copy composer files first for better caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --optimize-autoloader

# Copy application code
COPY . /var/www/html

# Complete composer installation
RUN composer dump-autoload --optimize --no-dev

# Create Laravel directories and set permissions
RUN mkdir -p storage/logs \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Production stage
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S laravel \
    && adduser -S laravel -u 1001 -G laravel

# Copy built application from build stage
COPY --from=build --chown=laravel:laravel /var/www/html /var/www/html

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/docker-php-custom.ini

# Security hardening
RUN rm -rf /var/cache/apk/* \
    && rm -rf /tmp/* \
    && find /var/www/html -name "*.md" -delete \
    && find /var/www/html -name ".git*" -delete

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Switch to non-root user
USER laravel

# Expose port 80
EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
