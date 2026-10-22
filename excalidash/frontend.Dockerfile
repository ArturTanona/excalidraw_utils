# ExcaliDash frontend rebuilt on a newer @excalidraw/excalidraw.
#
# Mirrors upstream frontend/Dockerfile (v0.6.5). The ExcaliDash source comes
# from the `excalidash-src` build context (a pinned git tag, set in compose.yaml);
# this directory supplies only the adapter for the newer Excalidraw API.
FROM node:20-alpine AS builder

WORKDIR /app/frontend

COPY --from=excalidash-src frontend/package*.json ./
RUN npm ci && npm cache clean --force

ARG EXCALIDRAW_VERSION
RUN test -n "$EXCALIDRAW_VERSION" \
    && npm install --no-save --no-audit --no-fund "@excalidraw/excalidraw@${EXCALIDRAW_VERSION}"

COPY --from=excalidash-src frontend/ ./
COPY --from=excalidash-src VERSION ../VERSION

COPY adapt-to-excalidraw-next.mjs exportToSvgCompat.ts /tmp/adapt/
RUN node /tmp/adapt/adapt-to-excalidraw-next.mjs

# Shown in ExcaliDash under Settings
ARG VITE_APP_BUILD_LABEL
ENV VITE_APP_BUILD_LABEL=$VITE_APP_BUILD_LABEL

RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine

COPY --from=excalidash-src --chown=nginx:nginx --chmod=0444 frontend/nginx.conf.template /etc/nginx/nginx.conf.template
COPY --from=excalidash-src --chown=nginx:nginx --chmod=0555 frontend/docker-entrypoint.sh /docker-entrypoint.sh
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-c", "/tmp/nginx.conf", "-g", "daemon off;"]
