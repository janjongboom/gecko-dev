/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifdef MOZ_JEMALLOC3

#define MOZ_JEMALLOC_IMPL

#include "mozmemory_wrap.h"
#include "mozilla/Types.h"

/* Override some jemalloc defaults */
MFBT_DATA const char * je_(malloc_conf) = "narenas:1,lg_chunk:20,tcache:false";

#ifdef ANDROID
#include <android/log.h>

static void
_je_malloc_message(void *cbopaque, const char *s)
{
  __android_log_print(ANDROID_LOG_INFO, "GeckoJemalloc", "%s", s);
}

void (*je_(malloc_message))(void *, const char *s) = _je_malloc_message;
#endif

#endif /* MOZ_JEMALLOC3 */

/* Provide an abort function for use in jemalloc code */
#include <mozilla/Assertions.h>

void moz_abort() {
  MOZ_CRASH();
}
