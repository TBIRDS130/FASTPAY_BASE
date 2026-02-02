from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response


class SkipLimitPagination(LimitOffsetPagination):
    default_limit = 100
    max_limit = 500
    limit_query_param = "limit"
    offset_query_param = "skip"

    def get_paginated_response(self, data):
        return Response(
            {
                "success": True,
                "data": data,
                "meta": {
                    "count": self.count,
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                    "limit": self.get_limit(self.request),
                    "skip": self.get_offset(self.request),
                },
            }
        )
